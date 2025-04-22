'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { fetchUsersByIds } from '@/app/utils/admin-api-client';
import { updateListingWithStatusSync } from '@/app/utils/listingStatusSync';
import OrderFilterBar from '../components/OrderFilterBar';
import OrdersTable from '../components/OrdersTable';
import OrderDetailsModal from '../components/OrderDetailsModal';
import OrderStatusModal from '../components/OrderStatusModal';
import PaymentStatusModal from '../components/PaymentStatusModal';

export default function OrdersAdminPage() {
  const [isClient, setIsClient] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const [buyerInfo, setBuyerInfo] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // For order detail viewing
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // For status changing
  const [orderToChangeStatus, setOrderToChangeStatus] = useState<any | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  
  // For payment status changing
  const [orderToChangePayment, setOrderToChangePayment] = useState<any | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // For filtering
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  // Client-side state initialization
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Fetch orders data with filters
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isClient) return;
      
      try {
        setIsLoading(true);
        
        const client = generateClient<Schema>({
          authMode: 'userPool'
        });
        
        // Build filter based on selected filters
        let filter: any = {};
        
        if (statusFilter !== 'all') {
          filter.orderStatus = { eq: statusFilter };
        }
        
        if (paymentFilter !== 'all') {
          filter.paymentStatus = { eq: paymentFilter };
        }
        
        // Fetch all orders with optional filters
        const { data: orderData } = await (client as any).models.Order.list({
          filter,
          sort: {
            field: 'createdAt',
            direction: 'desc'
          }
        });
        
        if (!orderData || orderData.length === 0) {
          setOrders([]);
          setOrderItems({});
          setBuyerInfo({});
          setIsLoading(false);
          return;
        }
        
        setOrders(orderData);
        
        // Collect unique buyer IDs to fetch their info
        const buyerIds = Array.from(new Set(orderData.map((order: any) => order.buyerId))) as string[];
        
        // Fetch buyer information
        if (buyerIds.length > 0) {
          try {
            const usersData = await fetchUsersByIds(buyerIds);
            setBuyerInfo(usersData);
          } catch (error) {
            console.error('Error fetching buyer information:', error);
            setBuyerInfo({});
          }
        }
        
        // Fetch order items for each order
        const itemsPromises = orderData.map(async (order: any) => {
          try {
            const { data: items } = await client.models.OrderItem.list({
              filter: {
                orderId: { eq: order.id }
              }
            });
            
            return { orderId: order.id, items: items || [] };
          } catch (error) {
            console.error(`Error fetching items for order ${order.id}:`, error);
            return { orderId: order.id, items: [] };
          }
        });
        
        const itemsResults = await Promise.all(itemsPromises);
        const itemsMap: Record<string, any[]> = {};
        
        itemsResults.forEach(result => {
          itemsMap[result.orderId] = result.items;
        });
        
        setOrderItems(itemsMap);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [isClient, statusFilter, paymentFilter]);
  
  // Function to change order status
  const changeOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const client = generateClient<Schema>({
        authMode: 'userPool'
      });
      
      // Update the order status
      await client.models.Order.update({
        id: orderId,
        orderStatus: newStatus
      });
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
      
      // Close the modal
      setIsStatusModalOpen(false);
      setOrderToChangeStatus(null);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };
  
  // Function to change payment status
  const changePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const client = generateClient<Schema>({
        authMode: 'userPool'
      });
      
      // Update the payment status
      await client.models.Order.update({
        id: orderId,
        paymentStatus: newStatus
      });
      
      // If status is set to 'paid', update all listings to 'unconfirmed'
      if (newStatus === 'paid') {
        const orderItemsList = orderItems[orderId] || [];
        
        // Update each listing to 'unconfirmed'
        await Promise.all(
          orderItemsList.map(async (item) => {
            try {
              await updateListingWithStatusSync(item.listingId, 'unconfirmed', 'userPool');
            } catch (error) {
              console.error(`Error updating listing ${item.listingId}:`, error);
            }
          })
        );
        
        // Update local state for order items (the listing status will be updated through the sync utility)
        const updatedItems = { ...orderItems };
        updatedItems[orderId] = orderItemsList.map(item => ({
          ...item,
          status: 'unconfirmed'
        }));
        setOrderItems(updatedItems);
      }
      
      // Update local state for the order
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, paymentStatus: newStatus } : order
        )
      );
      
      // Close the modal
      setIsPaymentModalOpen(false);
      setOrderToChangePayment(null);
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // View details handler
  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };
  
  // Change status handler
  const handleChangeStatus = (order: any) => {
    setOrderToChangeStatus(order);
    setIsStatusModalOpen(true);
  };
  
  // Change payment status handler
  const handleChangePayment = (order: any) => {
    setOrderToChangePayment(order);
    setIsPaymentModalOpen(true);
  };
  
  // Don't render on server to prevent hydration issues
  if (!isClient) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Orders Management</h1>
        
        <OrderFilterBar
          statusFilter={statusFilter}
          paymentFilter={paymentFilter}
          onStatusFilterChange={setStatusFilter}
          onPaymentFilterChange={setPaymentFilter}
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => {
                setStatusFilter('all');
                setPaymentFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-black text-white rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No orders found.</p>
          </div>
        ) : (
          <>
            <OrdersTable
              orders={orders.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              )}
              orderItems={orderItems}
              buyerInfo={buyerInfo}
              formatDate={formatDate}
              onViewDetails={handleViewDetails}
              onChangeStatus={handleChangeStatus}
              onChangePayment={handleChangePayment}
            />
            
            {/* Pagination */}
            {orders.length > itemsPerPage && (
              <div className="flex justify-between items-center mt-6 px-6 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, orders.length)}
                  </span>{' '}
                  of <span className="font-medium">{orders.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(orders.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(orders.length / itemsPerPage)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === Math.ceil(orders.length / itemsPerPage) 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Order Details Modal */}
        {isDetailsModalOpen && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            orderItems={orderItems[selectedOrder.id] || []}
            buyerInfo={buyerInfo[selectedOrder.buyerId]}
            formatDate={formatDate}
            onClose={() => setIsDetailsModalOpen(false)}
          />
        )}
        
        {/* Order Status Change Modal */}
        {isStatusModalOpen && orderToChangeStatus && (
          <OrderStatusModal
            order={orderToChangeStatus}
            onClose={() => setIsStatusModalOpen(false)}
            onStatusChange={changeOrderStatus}
          />
        )}
        
        {/* Payment Status Change Modal */}
        {isPaymentModalOpen && orderToChangePayment && (
          <PaymentStatusModal
            order={orderToChangePayment}
            onClose={() => setIsPaymentModalOpen(false)}
            onStatusChange={changePaymentStatus}
          />
        )}
      </main>
    </div>
  );
}
