'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import Link from 'next/link';
import type { Order, ShippingAddress } from '@/app/types';
import { use } from 'react';

interface OrderConfirmationPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  // Unwrap params with React.use() to comply with React 19 requirements
  const { orderId } = use(params);
  
  const router = useRouter();
  const { user } = useAuthenticator((context) => [context.user]);
  
  const [isClient, setIsClient] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!isClient || !user) return;
      
      try {
        setIsLoading(true);
        
        const client = generateClient<Schema>({
          authMode: 'userPool'
        });
        
        const { data: orderData } = await client.models.Order.get({
          id: orderId
        });
        
        if (!orderData) {
          setError('Order not found');
          return;
        }
        
        // Verify this order belongs to the current user
        if (orderData.buyerId !== user.username) {
          setError('You do not have permission to view this order');
          return;
        }
        
        setOrder(orderData as unknown as Order);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [isClient, orderId, user]);
  
  // Loading state
  if (!isClient || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }
  
  // Error state
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-sm border text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-medium mb-4">Order Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border">
        <div className="text-center mb-8">
          <div className="text-green-500 text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-medium">Order Placed Successfully!</h1>
          <p className="text-gray-600 mt-2">Order ID: {orderId}</p>
        </div>
        
        <div className="border-t border-b py-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Payment Instructions</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-base mb-4">
              Please complete your payment via {order.paymentMethod === 'venmo' ? 'Venmo' : 'PayPal'}:
            </p>
            
            <div className="font-medium">
              <p className="mb-2">{order.paymentInstructions}</p>
              <p>Amount: ${order.total.toFixed(2)}</p>
              <p>Include Reference: Order #{orderId.slice(0, 8)}</p>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>
              Your order will be processed once payment is confirmed. Sellers will then ship items to Scentra
              for verification before delivery to you.
            </p>
          </div>
        </div>
        
        <div className="border-b py-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Order Process</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-medium">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Send Payment</h3>
                <p className="text-gray-600 text-sm">
                  Send your total payment via <strong>Venmo or PayPal</strong> to Scentra (details provided above).
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-medium">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Payment Confirmation</h3>
                <p className="text-gray-600 text-sm">
                  Once Scentra confirms your payment, we'll notify the seller to confirm the sale.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-medium">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Seller Ships to Scentra</h3>
                <p className="text-gray-600 text-sm">
                  After the seller confirms, they ship the fragrance to our verification center.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-medium">4</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Authentication & Quality Check</h3>
                <p className="text-gray-600 text-sm">
                  Our experts verify the fragrance for authenticity, condition, and volume.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-medium">5</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Fragrance is Shipped to You</h3>
                <p className="text-gray-600 text-sm">
                  If everything checks out, we release the payment to the seller and ship the verified fragrance to you.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-700">
            <p className="font-medium">Payment Methods:</p>
            <p>Venmo: <span className="font-medium">@scentra</span> | PayPal: <span className="font-medium">@Scentra1</span></p>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Shipping Address</h2>
          <div className="text-sm text-gray-700">
            {(() => {
              // Parse the JSON string from the database into a ShippingAddress object
              const address = typeof order.shippingAddress === 'string' 
                ? JSON.parse(order.shippingAddress) as ShippingAddress 
                : order.shippingAddress as ShippingAddress;
                
              return (
                <>
                  <p>{address.firstName} {address.lastName}</p>
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                  <p>{address.country}</p>
                  <p className="mt-1">Phone: {address.phone}</p>
                </>
              );
            })()}
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
