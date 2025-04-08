'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/layout/Header';

interface CheckoutItem {
  id: number;
  productId: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  capacity: string;
  condition: 'New' | 'Used';
  percentage?: number;
}

// In a real app, this would come from the cart's state
const SAMPLE_CHECKOUT_ITEMS: CheckoutItem[] = [
  {
    id: 1,
    productId: 'BDC-100ML-NEW-001',
    name: 'Bleu de Chanel',
    brand: 'CHANEL',
    price: 145,
    image: '/fragrances/bleu.jpg',
    capacity: '100mL',
    condition: 'New'
  },
  {
    id: 2,
    productId: 'SVG-50ML-USED-023',
    name: 'Sauvage',
    brand: 'Dior',
    price: 85,
    image: '/fragrances/sauvage.jpg',
    capacity: '50mL',
    condition: 'Used',
    percentage: 75
  }
];

export default function CheckoutPage() {
  const router = useRouter();
  const [address, setAddress] = useState('1234 Market Street, San Francisco, CA 94103');
  const [isProcessing, setIsProcessing] = useState(false);
  const total = SAMPLE_CHECKOUT_ITEMS.reduce((sum, item) => sum + item.price, 0);

  const handlePaymentMethod = async (method: 'paypal' | 'venmo') => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Navigate to confirmation page
    router.push('/confirmation');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-bold text-black mb-4">Order Summary</h2>
              
              {/* Checkout Items */}
              <div className="space-y-6">
                {SAMPLE_CHECKOUT_ITEMS.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-20 h-20">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow">
                      <h3 className="text-base font-medium text-black">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.brand}</p>
                      <p className="text-sm text-gray-500">Product ID: {item.productId}</p>
                      <div className="text-sm text-gray-600 mt-1">
                        <span>{item.capacity}</span>
                        <span className="mx-2">·</span>
                        <span>{item.condition}</span>
                        {item.percentage && <span> ({item.percentage}% Full)</span>}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-base font-medium text-gray-700">
                      ${item.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black">Shipping Address</h2>
                <button
                  onClick={() => {}}
                  className="text-black font-medium hover:text-gray-700 transition-colors"
                >
                  Change
                </button>
              </div>
              <p className="text-gray-600">{address}</p>
            </div>
          </div>

          {/* Right Column - Order Total and Buy Button */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-black mb-4">Order Total</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-base text-gray-600">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-black">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Select Payment Method</p>
                    <button
                      onClick={() => handlePaymentMethod('paypal')}
                      disabled={isProcessing}
                      className="w-full px-6 py-3 bg-[#0070BA] text-white rounded-lg font-medium hover:bg-[#005ea6] transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        'Processing...'
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.1 6.34c.19 1.21-.03 2.04-.63 2.82-.68.87-1.8 1.32-3.16 1.32h-.29c-.22 0-.41.16-.44.38l-.44 2.83-.13.8c-.03.22-.23.39-.45.39h-2.46c-.22 0-.4-.18-.37-.4l.92-5.83c.03-.22.23-.38.45-.38h3.44c.99 0 1.73-.29 2.17-.84.4-.5.54-1.18.39-1.96-.2-1.09-.91-1.82-1.9-1.82h-6.09c-.22 0-.41.16-.44.38l-2.79 17.7c-.03.22.14.41.37.41h2.46c.22 0 .41-.16.44-.38l.71-4.5c.03-.22.23-.38.45-.38h1.85c1.36 0 2.48-.45 3.16-1.32.6-.78.82-1.61.63-2.82z"/>
                          </svg>
                          <span>Pay with PayPal</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handlePaymentMethod('venmo')}
                      disabled={isProcessing}
                      className="w-full px-6 py-3 bg-[#008CFF] text-white rounded-lg font-medium hover:bg-[#0074D4] transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        'Processing...'
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21.7 2.3C21.2 1.8 20.5 1.5 19.7 1.5H4.3C3.5 1.5 2.8 1.8 2.3 2.3C1.8 2.8 1.5 3.5 1.5 4.3V19.7C1.5 20.5 1.8 21.2 2.3 21.7C2.8 22.2 3.5 22.5 4.3 22.5H19.7C20.5 22.5 21.2 22.2 21.7 21.7C22.2 21.2 22.5 20.5 22.5 19.7V4.3C22.5 3.5 22.2 2.8 21.7 2.3ZM17.4 8.1C17.4 8.9 17.1 9.6 16.6 10.1C16.1 10.6 15.4 10.9 14.6 10.9H13.4L11.9 16.7C11.8 17 11.5 17.2 11.2 17.2H9.1C8.8 17.2 8.6 16.9 8.7 16.6L10.2 10.9H8.9C8.6 10.9 8.4 10.6 8.5 10.3L9.2 7.8C9.3 7.5 9.6 7.3 9.9 7.3H15.4C16.2 7.3 16.9 7.6 17.4 8.1Z"/>
                          </svg>
                          <span>Pay with Venmo</span>
                        </>
                      )}
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
