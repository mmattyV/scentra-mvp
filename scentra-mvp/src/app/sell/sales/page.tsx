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
            <div key={item.id} className="flex items-center gap-6 p-6 bg-white border rounded-lg shadow-sm">
              {/* Image */}
              <div className="relative w-24 h-24">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>

              {/* Product Info */}
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-black">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.brand}</p>
                <p className="text-sm text-gray-500 mt-1">Product ID: {item.productId}</p>
              </div>

              {/* Price */}
              <div className="text-lg font-medium text-gray-700">
                ${item.soldPrice}
              </div>

              {/* Status */}
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[item.status]}`}>
                  {STATUS_LABELS[item.status]}
                </span>

                {/* Unconfirmed Sale Actions */}
                {item.status === 'unconfirmed' && (
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={() => setExpandedAddressId(expandedAddressId === item.id ? null : item.id)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      View Buyer Address
                    </button>
                    
                    {expandedAddressId === item.id && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">{item.buyerAddress}</p>
                        {showConfirmation !== item.id ? (
                          <button
                            onClick={() => setShowConfirmation(item.id)}
                            className="mt-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                          >
                            Confirm Sale
                          </button>
                        ) : (
                          <div className="mt-2 space-y-2">
                            <p className="text-sm text-gray-700">Are you sure?</p>
                            <div className="flex space-x-2">
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
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
