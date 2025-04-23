'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';
import ShippingForm from '@/app/ui/components/ShippingForm';
import OrderSummary from '@/app/ui/components/OrderSummary';
import BuyerInstructionsModal from '@/app/ui/components/BuyerInstructionsModal';
import TermsOfServiceModal from '@/app/ui/components/TermsOfServiceModal';
import type { ShippingAddress } from '@/app/types';

export default function CheckoutPage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const { items, subtotal, validateCartItems, createOrder } = useCart();
  
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasValidationError, setHasValidationError] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<{
    shippingAddress: ShippingAddress;
    paymentMethod: 'venmo' | 'paypal';
  } | null>(null);
  
  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Validate cart state on mount - only run once
  useEffect(() => {
    const validateCart = async () => {
      try {
        if (items.length === 0) {
          router.push('/cart');
          return;
        }
        
        // Only validate items once when the component mounts
        // This prevents redirect loops when listings are being modified during checkout
        const hasChanges = await validateCartItems();
        
        // If there are unavailable items, redirect back to cart
        const hasUnavailableItems = items.some(item => !item.isAvailable);
        if (hasUnavailableItems) {
          setHasValidationError(true);
          alert('Some items in your cart are unavailable. Redirecting back to cart...');
          router.push('/cart');
        } else if (hasChanges) {
          // If only prices changed but items are available, show warning but don't redirect
          setHasChanges(true);
          alert('Some item prices have been updated. Please review before completing your purchase.');
        }
      } catch (error) {
        console.error('Error validating cart:', error);
        router.push('/cart');
      }
    };
    
    if (isClient && !isSubmitting) {
      if (!user) {
        router.push('/auth');
      } else {
        validateCart();
      }
    }
    // Only run validation once on mount, and not during checkout submission
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, user]);
  
  // Handle form submission
  const handleSubmit = async (shippingAddress: ShippingAddress, paymentMethod: 'venmo' | 'paypal') => {
    // Store the order data and show terms modal
    setPendingOrderData({ shippingAddress, paymentMethod });
    setIsTermsModalOpen(true);
  };
  
  // Handle terms acceptance and complete order
  const handleTermsAccept = async () => {
    setIsTermsModalOpen(false);
    
    if (!pendingOrderData) return;
    
    setIsSubmitting(true);
    
    try {
      // Call the createOrder method from CartContext
      const orderId = await createOrder(
        pendingOrderData.shippingAddress, 
        pendingOrderData.paymentMethod
      );
      
      // Redirect to confirmation page with order ID
      router.push(`/checkout/confirmation/${orderId}`);
    } catch (error) {
      console.error(error);
      alert('There was an error processing your order. Please try again.');
      
      // Force redirect to cart for any error from validation process
      // This ensures redirection happens regardless of the exact error message content
      router.replace('/cart');
      
      // Set isSubmitting to false just in case redirection is delayed
      setIsSubmitting(false);
    }
  };
  
  // Loading state or redirect if not client-side
  if (!isClient || !user || items.length === 0 || hasValidationError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - shipping form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Shipping Information</h2>
              <button
                onClick={() => setIsInstructionsModalOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                How It Works
              </button>
            </div>
            <ShippingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            
            <div className="mt-4 text-sm text-gray-600">
              <p>
                By proceeding to checkout, you'll be asked to agree to our{' '}
                <button 
                  onClick={() => setIsTermsModalOpen(true)}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Terms of Service
                </button>
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <Link
              href="/cart"
              className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Return to Cart
            </Link>
          </div>
        </div>
        
        {/* Order summary */}
        <div className="lg:col-span-1">
          <OrderSummary items={items} subtotal={subtotal} />
          
          {/* How It Works button for mobile */}
          <div className="mt-4 block lg:hidden">
            <button
              onClick={() => setIsInstructionsModalOpen(true)}
              className="w-full py-2 text-center text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              How It Works
            </button>
          </div>
        </div>
      </div>
      
      {/* Buyer Instructions Modal */}
      <BuyerInstructionsModal 
        isOpen={isInstructionsModalOpen} 
        onClose={() => setIsInstructionsModalOpen(false)} 
      />
      
      {/* Terms of Service Modal */}
      <TermsOfServiceModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={handleTermsAccept}
      />
    </div>
  );
}
