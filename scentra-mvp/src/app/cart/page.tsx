'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/layout/Header';

interface CartItem {
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

const SAMPLE_CART_ITEMS: CartItem[] = [
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
  },
  {
    id: 3,
    productId: 'EROS-200ML-NEW-045',
    name: 'Eros',
    brand: 'Versace',
    price: 120,
    image: '/fragrances/eros.jpg',
    capacity: '200mL',
    condition: 'New'
  }
];

export default function CartPage() {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [address, setAddress] = useState('1234 Market Street, San Francisco, CA 94103');

  const toggleItem = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const calculateTotal = () => {
    return SAMPLE_CART_ITEMS
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Shopping Cart</h1>

        {/* Cart Items */}
        <div className="space-y-4 mb-12">
          {SAMPLE_CART_ITEMS.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => toggleItem(item.id)}
                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
              />

              {/* Image */}
              <div className="relative w-16 h-16 md:w-24 md:h-24 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>

              {/* Product Info and Details */}
              <div className="flex-grow min-w-0">
                <div>
                  <h3 className="text-base md:text-lg font-medium text-black truncate">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.brand}</p>
                </div>
                
                <div className="mt-2">
                  {/* Details */}
                  <div className="text-sm text-gray-600">
                    <p>{item.capacity} • {item.condition}{item.percentage ? ` • ${item.percentage}% Full` : ''}</p>
                  </div>
                </div>
              </div>

              {/* Price and Delete */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-base md:text-lg font-medium text-gray-700 mt-0.5">
                  ${item.price}
                </div>

                <button
                  onClick={() => {}}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Shipping Address */}
        <div className="max-w-2xl mx-auto mb-20 p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-black">Shipping Address</h2>
            <button
              onClick={() => {}}
              className="text-black font-medium hover:text-gray-700 transition-colors underline text-sm"
            >
              Change
            </button>
          </div>
          <p className="text-gray-600 text-sm md:text-base break-words">{address}</p>
        </div>

        {/* Total and Checkout */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-lg md:text-xl font-bold text-gray-700">
              Total: ${calculateTotal().toFixed(2)}
            </div>
            <button
              onClick={() => router.push('/checkout')}
              className="px-6 md:px-8 py-2 md:py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
              disabled={selectedItems.size === 0}
            >
              Checkout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
