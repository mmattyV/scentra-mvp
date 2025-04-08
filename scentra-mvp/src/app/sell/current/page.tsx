'use client';

import Image from 'next/image';
import Header from '../../components/layout/Header';

interface ListingItem {
  id: number;
  productId: string;
  name: string;
  brand: string;
  askPrice: number;
  image: string;
}

const SAMPLE_LISTINGS: ListingItem[] = [
  {
    id: 1,
    productId: 'BDC-100ML-NEW-001',
    name: 'Bleu de Chanel',
    brand: 'CHANEL',
    askPrice: 145,
    image: '/fragrances/bleu.jpg'
  },
  {
    id: 2,
    productId: 'SVG-50ML-USED-023',
    name: 'Sauvage',
    brand: 'Dior',
    askPrice: 85,
    image: '/fragrances/sauvage.jpg'
  },
  {
    id: 3,
    productId: 'EROS-200ML-NEW-045',
    name: 'Eros',
    brand: 'Versace',
    askPrice: 120,
    image: '/fragrances/eros.jpg'
  }
];

export default function CurrentListingsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Current Listings</h1>

        {/* Listings */}
        <div className="space-y-4 mb-12">
          {SAMPLE_LISTINGS.map((item) => (
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

              {/* Ask Price */}
              <div className="text-lg font-medium text-gray-700">
                ${item.askPrice}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {}}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Change Ask
                </button>
                <button
                  onClick={() => {}}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  Take Down
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
