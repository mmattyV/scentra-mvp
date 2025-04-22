'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { 
    items, 
    removeItem, 
    clearCart, 
    subtotal, 
    validateCartItems, 
    isValidating,
    removeUnavailableItems 
  } = useCart();
  const router = useRouter();
  
  const [isClient, setIsClient] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isValidatingCheckout, setIsValidatingCheckout] = useState(false);
  
  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Validate cart items once after client-side mount
  useEffect(() => {
    const validateCart = async () => {
      if (items.length > 0) {
        const changes = await validateCartItems();
        setHasChanges(changes);
      }
    };
    if (isClient) validateCart();
  }, [isClient]);

  // Prevent checkout of own listings
  const hasOwnItems = user ? items.some(item => item.sellerId === user.username) : false;

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  // Early return for server-side rendering or empty cart
  if (!isClient) {
    return null;
  }
  
  // Empty cart view
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold mb-8">Your Cart</h1>
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any fragrances to your cart yet.</p>
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          Clear Cart
        </button>
      </div>
      
      {/* Cart status alert */}
      {hasChanges && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Cart items have changed</h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>Some items in your cart have been updated or are no longer available.</p>
              </div>
              <div className="mt-2">
                <button
                  onClick={removeUnavailableItems}
                  className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                >
                  Remove unavailable items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row">
                    {/* Item Image */}
                    <div className="relative w-full sm:w-24 h-24 mb-4 sm:mb-0 flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.fragranceName}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1 sm:ml-6 flex flex-col justify-between">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Left column - Item details */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {item.fragranceName}
                            {!item.isAvailable && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Unavailable
                              </span>
                            )}
                            {item.priceChanged && item.isAvailable && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Price updated
                              </span>
                            )}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">{item.brand}</p>
                          <div className="mt-2 text-sm text-gray-500">
                            <p>Size: {item.bottleSize}</p>
                            <p>Condition: {item.condition}</p>
                            {item.condition === 'used' && item.percentRemaining !== undefined && item.percentRemaining < 100 && (
                              <p>{item.percentRemaining}% remaining</p>
                            )}
                            {item.condition === 'used' && item.percentRemaining === 100 && (
                              <p>Open box</p>
                            )}
                            <p>{item.hasOriginalBox ? 'Includes original box' : 'No original box'}</p>
                          </div>
                        </div>
                        
                        {/* Right column - Price and actions */}
                        <div className="flex flex-col items-start sm:items-end justify-between">
                          <div className="text-right">
                            {item.priceChanged ? (
                              <div>
                                <p className="text-sm text-gray-500 line-through">
                                  {formatPrice(item.originalPrice)}
                                </p>
                                <p className="text-lg font-medium text-gray-900">
                                  {formatPrice(item.currentPrice)}
                                </p>
                              </div>
                            ) : (
                              <p className="text-lg font-medium text-gray-900">
                                {formatPrice(item.currentPrice)}
                              </p>
                            )}
                          </div>
                          
                          <div className="mt-4 sm:mt-0">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
            
            <div className="border-t border-b py-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-600">Subtotal</p>
                <p className="font-medium">{formatPrice(subtotal)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Shipping & Verification</p>
                <p className="font-medium">TBD at checkout</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <p className="text-lg font-medium">Total</p>
              <p className="text-lg font-bold">{formatPrice(subtotal)}</p>
            </div>
            
            <button
              onClick={async () => {
                setIsValidatingCheckout(true);
                try {
                  // Validate cart items before proceeding to checkout
                  const changes = await validateCartItems();
                  setHasChanges(changes);
                  
                  // Prevent checkout if there are unavailable items
                  const hasUnavailableItems = items.some(item => !item.isAvailable);
                  
                  if (hasUnavailableItems) {
                    alert('Please remove unavailable items before proceeding to checkout.');
                    return;
                  }
                  
                  // Prevent checkout if cart is empty
                  if (items.length === 0) {
                    alert('Your cart is empty.');
                    return;
                  }
                  
                  // Prevent checkout of own listings
                  if (hasOwnItems) {
                    alert('You cannot purchase your own listings.');
                    return;
                  }
                  
                  // Proceed to checkout
                  router.push('/checkout');
                } catch (error) {
                  console.error('Error validating cart:', error);
                  alert('There was an error validating your cart. Please try again.');
                } finally {
                  setIsValidatingCheckout(false);
                }
              }}
              disabled={items.some(item => !item.isAvailable) || items.length === 0 || hasOwnItems || isValidating || isValidatingCheckout}
              className={`w-full py-4 rounded-lg font-medium transition-colors ${
                (items.some(item => !item.isAvailable) || hasOwnItems || isValidating || isValidatingCheckout)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isValidating || isValidatingCheckout
                ? 'Validating Cart...'
                : hasOwnItems
                  ? 'Remove Your Own Items'
                  : items.some(item => !item.isAvailable)
                    ? 'Some items unavailable'
                    : 'Proceed to Checkout'}
            </button>
            
            {items.some(item => !item.isAvailable) && (
              <p className="mt-2 text-sm text-red-600 text-center">
                Please remove unavailable items before checkout
              </p>
            )}
            
            {hasOwnItems && (
              <p className="mt-2 text-sm text-red-600 text-center">
                Remove your own listing(s) before proceeding to checkout
              </p>
            )}
            
            <p className="mt-4 text-sm text-gray-500 text-center">
              Shipping and verification fees will be calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
