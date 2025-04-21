'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import Link from 'next/link';
import type { Order, OrderItem, ShippingAddress } from '@/app/types';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/app/types';
import OrderDetails from '@/app/ui/components/OrderDetails';
import CancelOrderModal from '@/app/ui/components/CancelOrderModal';
import { updateListingWithStatusSync } from '@/app/utils/listingStatusSync';

// Define our extended Order type that includes items
interface OrderWithItems extends Order {
  orderItems: OrderItem[];
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const { user, authStatus } = useAuthenticator((context) => [context.user, context.authStatus]);
  
  const [isClient, setIsClient] = useState(false);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<OrderWithItems | null>(null);
  
  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Redirect if not logged in, but only after authentication has been checked
  useEffect(() => {
    if (!isClient) return; // Don't run on server
    
    // Wait until authentication is ready before making decisions
    if (authStatus !== 'authenticated' && authStatus !== 'unauthenticated') {
      // Auth is still initializing, don't redirect yet
      setIsLoading(true);
      return;
    }
    
    if (authStatus === 'unauthenticated') {
      // Only redirect if explicitly unauthenticated
      router.push('/auth');
    } else {
      // We're authenticated and ready to fetch data
      setIsLoading(false);
    }
  }, [isClient, authStatus, router]);
  
  // Fetch user's orders and their items
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isClient || !user) return;
      
      try {
        setIsLoading(true);
        
        const client = generateClient<Schema>({
          authMode: 'userPool'
        });
        
        // Query orders where buyerId matches the current user
        const { data: orderData } = await client.models.Order.list({
          filter: {
            buyerId: { eq: user.username }
          },
          // Use the type assertion to handle the sort parameter
          ...(({
            sort: {
              field: 'createdAt',
              direction: 'DESC'
            }
          } as any))
        });
        
        if (!orderData) {
          setOrders([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch order items for each order
        const ordersWithItems = await Promise.all(
          orderData.map(async (order) => {
            try {
              const { data: itemsData } = await client.models.OrderItem.list({
                filter: {
                  orderId: { eq: order.id }
                }
              });
              
              // Use a type assertion to match our interface
              return {
                ...order,
                orderItems: itemsData || []
              } as unknown as OrderWithItems;
            } catch (error) {
              console.error(`Error fetching items for order ${order.id}:`, error);
              return {
                ...order,
                orderItems: []
              } as unknown as OrderWithItems;
            }
          })
        );
        
        setOrders(ordersWithItems);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load your order history');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [isClient, user]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  // Toggle order details view
  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };
  
  // Handle order cancellation
  const handleCancelOrder = (order: OrderWithItems) => {
    setOrderToCancel(order);
  };
  
  // Process the actual cancellation
  const processCancelOrder = async () => {
    if (!orderToCancel) return;
    
    try {
      const client = generateClient<Schema>({
        authMode: 'userPool'
      });
      
      // Update the order status to cancelled
      await client.models.Order.update({
        id: orderToCancel.id,
        orderStatus: 'cancelled'
      });
      
      // If payment is still pending, reactivate all listings
      if (orderToCancel.paymentStatus === 'awaiting_payment') {
        // Get the listings associated with this order
        await Promise.all(
          orderToCancel.orderItems.map(async (item) => {
            try {
              // Reactivate each listing by setting its status back to active
              await updateListingWithStatusSync(item.listingId, 'active', 'userPool');
            } catch (error) {
              console.error(`Error reactivating listing ${item.listingId}:`, error);
            }
          })
        );
      }
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderToCancel.id 
            ? { ...order, orderStatus: 'cancelled' } 
            : order
        )
      );
      
      // Close the cancel modal
      setOrderToCancel(null);
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error('Failed to cancel order');
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-8">Order History</h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-8">Order History</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-8">Order History</h1>
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h2 className="text-xl font-medium mb-4">No orders yet</h2>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Browse Fragrances
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-8">Order History</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Order Summary Row */}
            <div 
              className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 cursor-pointer ${
                expandedOrder === order.id ? 'border-b border-gray-200' : ''
              }`}
              onClick={() => toggleOrderDetails(order.id)}
            >
              <div className="flex flex-col mb-4 sm:mb-0">
                <div className="flex items-center">
                  <span className="text-lg font-medium text-gray-900 mr-2">
                    Order #{order.id.slice(0, 8)}
                  </span>
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${ORDER_STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
                    {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-base font-medium text-gray-900">{formatPrice(order.total)}</p>
                </div>
                
                <svg 
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            
            {/* Order Details */}
            {expandedOrder === order.id && (
              <div className="px-6 py-4">
                <OrderDetails 
                  order={order} 
                  items={order.orderItems}
                  onCancelOrder={order.orderStatus !== 'cancelled' ? () => handleCancelOrder(order) : undefined}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Cancel Order Modal */}
      {orderToCancel && (
        <CancelOrderModal 
          order={orderToCancel}
          canCancel={orderToCancel.paymentStatus === 'awaiting_payment'}
          onClose={() => setOrderToCancel(null)}
          onConfirm={processCancelOrder}
        />
      )}
    </div>
  );
}
