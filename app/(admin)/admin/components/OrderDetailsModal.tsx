'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { STATUS_COLORS, STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/app/types';
import type { Order, OrderItem, ShippingAddress } from '@/app/types';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

interface OrderDetailsModalProps {
  order: Order;
  orderItems: OrderItem[];
  buyerInfo: any;
  formatDate: (date: string) => string;
  onClose: () => void;
}

interface SellerPaymentPreference {
  sellerId: string;
  preferredMethod: string;
  paymentHandle: string;
}

export default function OrderDetailsModal({
  order,
  orderItems,
  buyerInfo,
  formatDate,
  onClose
}: OrderDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'shipping'>('details');
  const [sellerPaymentPreferences, setSellerPaymentPreferences] = useState<Record<string, SellerPaymentPreference>>({});
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [listings, setListings] = useState<Record<string, any>>({});
  
  // Fetch seller payment preferences and listing details when items tab is viewed
  useEffect(() => {
    if (activeTab === 'items' && orderItems.length > 0) {
      fetchSellerPaymentPreferences();
      fetchListingsAndImages();
    }
  }, [activeTab, orderItems]);

  // First fetch the listings that are associated with each order item
  // Then use those listings to get the S3 image keys
  const fetchListingsAndImages = async () => {
    if (orderItems.length === 0) return;
    
    try {
      setIsLoadingImages(true);
      const client = generateClient<Schema>({
        authMode: 'userPool'
      });
      
      // Get all the listing IDs from the order items
      const listingIds = orderItems.map(item => item.listingId);
      
      // Fetch all the listings in parallel
      const listingResults = await Promise.all(
        listingIds.map(async (listingId) => {
          try {
            const { data } = await client.models.Listing.get({
              id: listingId
            });
            
            return data;
          } catch (error) {
            console.error(`Error fetching listing ${listingId}:`, error);
            return null;
          }
        })
      );
      
      // Create a map of listing ID to listing data
      const listingsMap: Record<string, any> = {};
      listingResults.forEach(listing => {
        if (listing) {
          listingsMap[listing.id] = listing;
        }
      });
      
      setListings(listingsMap);
      
      // Now fetch the S3 image URLs for each listing that has an imageKey
      const { getUrl } = await import('aws-amplify/storage');
      const urls: Record<string, string> = {};
      
      // Use the listings to get the image URLs
      await Promise.all(
        orderItems.map(async (item) => {
          const listing = listingsMap[item.listingId];
          
          if (listing && listing.imageKey && typeof listing.imageKey === 'string' && listing.imageKey.trim() !== '') {
            try {
              // Always use the seller-uploaded image from S3
              const result = await getUrl({
                path: listing.imageKey
              });
              urls[item.id] = result.url.toString();
            } catch (error) {
              console.error(`Error fetching image for item ${item.id}:`, error);
              // Use a default/placeholder image on error
              urls[item.id] = '/placeholder-fragrance.jpg';
            }
          } else {
            urls[item.id] = '/placeholder-fragrance.jpg';
          }
        })
      );
      
      setImageUrls(urls);
    } catch (error) {
      console.error('Error fetching listings and images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  };
  
  const fetchSellerPaymentPreferences = async () => {
    if (orderItems.length === 0) return;
    
    // Get unique seller IDs without using spread on Set
    const sellerIdsSet = new Set<string>();
    orderItems.forEach(item => sellerIdsSet.add(item.sellerId));
    const sellerIds = Array.from(sellerIdsSet);
    
    if (sellerIds.length === 0) return;
    
    try {
      setIsLoadingPreferences(true);
      const client = generateClient<Schema>({
        authMode: 'userPool'
      });
      
      // Fetch payment preferences for all sellers
      const results = await Promise.all(
        sellerIds.map(async (sellerId) => {
          try {
            const { data } = await client.models.SellerPaymentPreference.list({
              filter: { sellerId: { eq: sellerId } }
            });
            
            if (data && data.length > 0) {
              return {
                sellerId,
                preferredMethod: data[0].preferredMethod,
                paymentHandle: data[0].paymentHandle
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching payment preference for seller ${sellerId}:`, error);
            return null;
          }
        })
      );
      
      // Convert to a map by seller ID
      const preferencesMap: Record<string, SellerPaymentPreference> = {};
      results.forEach(result => {
        if (result) {
          preferencesMap[result.sellerId] = result;
        }
      });
      
      setSellerPaymentPreferences(preferencesMap);
    } catch (error) {
      console.error('Error fetching seller payment preferences:', error);
    } finally {
      setIsLoadingPreferences(false);
    }
  };
  
  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  // Parse the shipping address from JSON if needed
  const getShippingAddress = (): ShippingAddress => {
    if (typeof order.shippingAddress === 'string') {
      return JSON.parse(order.shippingAddress) as ShippingAddress;
    }
    return order.shippingAddress as ShippingAddress;
  };
  
  const shippingAddress = getShippingAddress();
  
  // Get buyer name
  const getBuyerName = () => {
    if (!buyerInfo) return 'Unknown';
    
    if (buyerInfo.firstName && buyerInfo.lastName) {
      return `${buyerInfo.firstName} ${buyerInfo.lastName}`;
    }
    
    return buyerInfo.username || buyerInfo.email || 'Unknown';
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium">
            Order Details: #{order.id.slice(0, 8)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Order Details
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'items'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('items')}
            >
              Order Items ({orderItems.length})
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'shipping'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping & Payment
            </button>
          </nav>
        </div>
        
        {/* Content area with overflow scroll */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Order Status</h4>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      ORDER_STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Payment Status</h4>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                        order.paymentStatus === 'refunded' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus === 'awaiting_payment' ? 'Awaiting Payment' :
                        order.paymentStatus === 'paid' ? 'Paid' : 'Refunded'}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Order Date</h4>
                  <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Order Total</h4>
                  <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                </div>
              </div>
              
              {/* Buyer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Buyer Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium">{getBuyerName()}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{buyerInfo?.email || 'No email'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{buyerInfo?.phone || shippingAddress.phone || 'No phone'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-sm font-medium truncate">{order.buyerId}</p>
                  </div>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="text-sm font-medium capitalize">{order.paymentMethod}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Subtotal</p>
                    <p className="text-sm font-medium">{formatPrice(order.subtotal)}</p>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500">Payment Instructions</p>
                    <p className="text-sm">{order.paymentInstructions}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'items' && (
            <div className="space-y-4">
              {orderItems.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No items found for this order.</p>
              ) : (
                orderItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 flex flex-col sm:flex-row">
                    <div className="w-20 h-20 relative flex-shrink-0 mb-4 sm:mb-0">
                      {isLoadingImages ? (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md"></div>
                      ) : (
                        <Image
                          src={imageUrls[item.id] || '/placeholder-fragrance.jpg'}
                          alt={item.fragranceName}
                          fill
                          className="object-contain rounded-md"
                        />
                      )}
                    </div>
                    
                    <div className="sm:ml-4 flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">{item.fragranceName}</h5>
                          <p className="text-sm text-gray-500">{item.brand}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.bottleSize} • {item.condition}
                            {item.condition === 'used' && item.percentRemaining !== undefined && 
                              ` • ${item.percentRemaining}% remaining`}
                            {` • ${item.hasOriginalBox ? 'With original box' : 'No original box'}`}
                          </p>
                          
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">Seller ID: <span className="font-medium">{item.sellerId.slice(0, 8)}</span></p>
                            <p className="text-xs text-gray-500">Listing ID: <span className="font-medium">{item.listingId.slice(0, 8)}</span></p>
                            {sellerPaymentPreferences[item.sellerId] && (
                              <div>
                                <p className="text-xs text-gray-500">Preferred Payment Method:</p>
                                <p className="text-sm font-medium">{sellerPaymentPreferences[item.sellerId].preferredMethod}</p>
                                <p className="text-xs text-gray-500">Payment Handle:</p>
                                <p className="text-sm font-medium">{sellerPaymentPreferences[item.sellerId].paymentHandle}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 sm:mt-0 text-right">
                          <p className="text-sm font-medium text-gray-900">{formatPrice(item.price)}</p>
                          
                          <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-800'}`}>
                            {STATUS_LABELS[item.status] || item.status}
                          </span>
                          
                          <p className="text-xs text-gray-500 mt-1">
                            Status controlled by listing
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              {/* Shipping Address */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Shipping Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{shippingAddress.phone}</p>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm">{shippingAddress.addressLine1}</p>
                    {shippingAddress.addressLine2 && <p className="text-sm">{shippingAddress.addressLine2}</p>}
                    <p className="text-sm">
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                    </p>
                    <p className="text-sm">{shippingAddress.country}</p>
                  </div>
                </div>
              </div>
              
              {/* Payment Instructions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Details</h4>
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="text-sm font-medium capitalize mb-2">{order.paymentMethod}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Payment Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                      order.paymentStatus === 'refunded' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus === 'awaiting_payment' ? 'Awaiting Payment' :
                      order.paymentStatus === 'paid' ? 'Paid' : 'Refunded'}
                  </span>
                </div>
                
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Payment Instructions</p>
                  <div className="bg-white p-3 rounded border border-gray-200 mt-1">
                    <p className="text-sm">
                      {order.paymentInstructions}
                    </p>
                    <p className="text-sm mt-1">
                      Amount: {formatPrice(order.total)}
                    </p>
                    <p className="text-sm">
                      Reference: Order #{order.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              {order.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Order Notes</h4>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
