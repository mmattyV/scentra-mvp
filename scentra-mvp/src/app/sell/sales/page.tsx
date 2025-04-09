'use client';

import Image from 'next/image';
import { useState } from 'react';
import Header from '../../components/layout/Header';

type SaleStatus = 'unconfirmed' | 'confirmed' | 'shipping_to_scentra' | 'verifying' | 'shipping_to_buyer' | 'completed';

interface SaleItem {
  id: number;
  productId: string;
  name: string;
  brand: string;
  soldPrice: number;
  image: string;
  status: SaleStatus;
  buyerAddress?: string;
}

const SAMPLE_SALES: SaleItem[] = [
  {
    id: 1,
    productId: 'BDC-100ML-NEW-001',
    name: 'Bleu de Chanel',
    brand: 'CHANEL',
    soldPrice: 145,
    image: '/fragrances/bleu.jpg',
    status: 'unconfirmed',
    buyerAddress: '123 Main St, New York, NY 10001'
  },
  {
    id: 2,
    productId: 'SVG-50ML-USED-023',
    name: 'Sauvage',
    brand: 'Dior',
    soldPrice: 85,
    image: '/fragrances/sauvage.jpg',
    status: 'shipping_to_scentra'
  },
  {
    id: 3,
    productId: 'EROS-200ML-NEW-045',
    name: 'Eros',
    brand: 'Versace',
    soldPrice: 120,
    image: '/fragrances/eros.jpg',
    status: 'completed'
  }
];

const STATUS_LABELS: Record<SaleStatus, string> = {
  unconfirmed: 'Unconfirmed',
  confirmed: 'Confirmed',
  shipping_to_scentra: 'Shipping to Scentra',
  verifying: 'Verifying',
  shipping_to_buyer: 'Shipping to Buyer',
  completed: 'Completed'
};

const STATUS_COLORS: Record<SaleStatus, string> = {
  unconfirmed: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipping_to_scentra: 'bg-purple-100 text-purple-800',
  verifying: 'bg-orange-100 text-orange-800',
  shipping_to_buyer: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800'
};

export default function SalesPage() {
  const [expandedAddressId, setExpandedAddressId] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<number | null>(null);

  const handleConfirm = (id: number) => {
    // Handle confirmation logic here
    setShowConfirmation(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Sales</h1>

        {/* Sales List */}
        <div className="space-y-4 mb-12">
          {SAMPLE_SALES.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg shadow-sm relative">
              <div className="flex items-center gap-4 md:gap-6 p-4 md:p-6">
                {/* Image */}
                <div className="relative w-16 h-16 md:w-24 md:h-24 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>

                {/* Product Info - Middle Section */}
                <div className="flex-grow min-w-0">
                  <h3 className="text-base md:text-lg font-medium text-black truncate">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.brand}</p>
                  <p className="text-sm text-gray-500 mt-1">ID: {item.productId}</p>
                </div>
                
                {/* Price */}
                <div className="text-base md:text-lg font-medium text-gray-700 flex-shrink-0 mr-2">
                  ${item.soldPrice}
                </div>

                {/* Status */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap ${STATUS_COLORS[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>

                  {/* Unconfirmed Sale Actions */}
                  {item.status === 'unconfirmed' && (
                    <button
                      onClick={() => setExpandedAddressId(expandedAddressId === item.id ? null : item.id)}
                      className="px-3 py-1 text-xs md:text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      View Buyer Address
                    </button>
                  )}
                </div>
              </div>
              
              {/* Address & Confirmation - Separate from main content */}
              {expandedAddressId === item.id && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="max-w-lg mx-auto">
                    <h4 className="font-medium text-sm text-gray-800 mb-2">Buyer Address:</h4>
                    <p className="text-sm text-gray-800 mb-4 p-3 bg-white border rounded-md">{item.buyerAddress}</p>
                    
                    {showConfirmation !== item.id ? (
                      <div className="flex justify-end">
                        <button
                          onClick={() => setShowConfirmation(item.id)}
                          className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                          Confirm Sale
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white border rounded-md">
                        <p className="text-sm font-medium text-gray-700">Are you sure?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirm(item.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setShowConfirmation(null)}
                            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
