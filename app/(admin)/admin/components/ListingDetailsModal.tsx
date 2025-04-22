'use client';

import { useState, useEffect } from 'react';
import type { Listing, UserData, FragranceDetails } from '@/app/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/app/types';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

interface ListingDetailsModalProps {
  listing: Listing;
  sellerInfo: UserData | undefined;
  fragranceDetails: FragranceDetails;
  buyerInfo?: UserData | null;
  orderId?: string | null;
  onClose: () => void;
}

export default function ListingDetailsModal({
  listing,
  sellerInfo,
  fragranceDetails,
  buyerInfo = null,
  orderId = null,
  onClose
}: ListingDetailsModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentPreference, setPaymentPreference] = useState<{
    preferredMethod: string;
    paymentHandle: string;
  } | null>(null);
  const [isLoadingPaymentPreference, setIsLoadingPaymentPreference] = useState(false);
  
  // Get image URL from S3
  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        setIsLoading(true);
        
        if (!listing.imageKey) {
          // If no imageKey exists, use a placeholder image
          setImageUrl('/placeholder-fragrance.jpg');
          return;
        }
        
        const { getUrl } = await import('aws-amplify/storage');
        const result = await getUrl({
          path: listing.imageKey
        });
        
        // Always use the seller's uploaded image from S3
        setImageUrl(result.url.toString());
      } catch (error) {
        console.error('Error fetching image URL:', error);
        setImageUrl('/placeholder-fragrance.jpg');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchImageUrl();
  }, [listing.imageKey]);
  
  // Fetch seller payment preferences
  useEffect(() => {
    const fetchSellerPaymentPreferences = async () => {
      if (!listing.sellerId) return;
      
      try {
        setIsLoadingPaymentPreference(true);
        const client = generateClient<Schema>({
          authMode: 'userPool'
        });
        
        const { data } = await client.models.SellerPaymentPreference.list({
          filter: {
            sellerId: { eq: listing.sellerId }
          }
        });
        
        if (data && data.length > 0) {
          setPaymentPreference({
            preferredMethod: data[0].preferredMethod,
            paymentHandle: data[0].paymentHandle
          });
        }
      } catch (error) {
        console.error('Error fetching seller payment preferences:', error);
      } finally {
        setIsLoadingPaymentPreference(false);
      }
    };
    
    fetchSellerPaymentPreferences();
  }, [listing.sellerId]);
  
  // Format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium">Listing Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: Image and product details */}
            <div>
              <div className="mb-4 aspect-square relative bg-gray-100 rounded-md overflow-hidden">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent"></div>
                  </div>
                ) : imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={fragranceDetails.name} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Product Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">Name:</span>{' '}
                    <span className="font-medium">{fragranceDetails.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Brand:</span>{' '}
                    <span>{fragranceDetails.brand}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Product ID:</span>{' '}
                    <span className="font-mono text-sm">{listing.fragranceId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Bottle Size:</span>{' '}
                    <span>{listing.bottleSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Condition:</span>{' '}
                    <span>{listing.condition}</span>
                  </div>
                  {listing.condition === 'used' && listing.percentRemaining && (
                    <div>
                      <span className="text-gray-500">Remaining:</span>{' '}
                      <span>{listing.percentRemaining}%</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Original Box:</span>{' '}
                    <span>{listing.hasOriginalBox ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price:</span>{' '}
                    <span className="font-medium">${listing.askingPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column: Seller, status, and listing details */}
            <div>
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Listing Details</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">Listing ID:</span>{' '}
                    <span className="font-mono text-sm">{listing.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>{' '}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[listing.status] || 'bg-gray-100 text-gray-800'}`}>
                      {STATUS_LABELS[listing.status] || listing.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>{' '}
                    <span>{formatDate(listing.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Seller Information</h4>
                {sellerInfo ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-500">Username:</span>{' '}
                      <span>{sellerInfo.username}</span>
                    </div>
                    {sellerInfo.firstName && sellerInfo.lastName && (
                      <div>
                        <span className="text-gray-500">Name:</span>{' '}
                        <span>{sellerInfo.firstName} {sellerInfo.lastName}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Email:</span>{' '}
                      <span>{sellerInfo.email}</span>
                    </div>
                    {sellerInfo.phone && (
                      <div>
                        <span className="text-gray-500">Phone:</span>{' '}
                        <span>{sellerInfo.phone}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Seller ID:</span>{' '}
                      <span className="font-mono text-sm">{sellerInfo.userId}</span>
                    </div>
                    
                    {/* Payment Preferences */}
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <span className="text-gray-500 font-medium">Payment Preferences:</span>
                      {isLoadingPaymentPreference ? (
                        <div className="flex items-center mt-1">
                          <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                          <span className="text-sm text-gray-500">Loading payment info...</span>
                        </div>
                      ) : paymentPreference ? (
                        <div className="mt-1 space-y-1">
                          <div>
                            <span className="text-gray-500">Method:</span>{' '}
                            <span className="capitalize">{paymentPreference.preferredMethod}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Handle:</span>{' '}
                            <span>{paymentPreference.paymentHandle}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <span className="text-sm text-gray-500">No payment preferences set</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Seller information not available</p>
                )}
              </div>
              
              {/* Buyer Information */}
              {['unconfirmed', 'shipping_to_scentra', 'verifying', 'shipping_to_buyer', 'completed'].includes(listing.status) && (
                <div>
                  <h4 className="text-lg font-medium mb-2">Buyer Information</h4>
                  {buyerInfo ? (
                    <div className="space-y-2 bg-blue-50 p-3 rounded-md">
                      <div>
                        <span className="text-gray-500">Username:</span>{' '}
                        <span className="font-medium">{buyerInfo.username}</span>
                      </div>
                      {buyerInfo.firstName && buyerInfo.lastName && (
                        <div>
                          <span className="text-gray-500">Name:</span>{' '}
                          <span>{buyerInfo.firstName} {buyerInfo.lastName}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Email:</span>{' '}
                        <span>{buyerInfo.email}</span>
                      </div>
                      {buyerInfo.phone && (
                        <div>
                          <span className="text-gray-500">Phone:</span>{' '}
                          <span>{buyerInfo.phone}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Buyer ID:</span>{' '}
                        <span className="font-mono text-sm">{buyerInfo.userId}</span>
                      </div>
                      {orderId && (
                        <div>
                          <span className="text-gray-500">Order ID:</span>{' '}
                          <span className="font-mono text-sm">{orderId}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                      <p className="mb-1">
                        {listing.status === 'unconfirmed' ? 
                          'This listing has been purchased but buyer information is not available.' :
                          'Buyer information is not available for this listing.'}
                      </p>
                      <p>
                        <span className="font-medium">Order ID:</span>{' '}
                        {orderId ? <span className="font-mono">{orderId}</span> : 'Not available'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
