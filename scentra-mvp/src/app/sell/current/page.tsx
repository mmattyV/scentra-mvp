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
            <div key={item.id} className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-white border rounded-lg shadow-sm">
              {/* Image */}
              <div className="relative w-16 h-16 md:w-24 md:h-24 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>

              {/* Product Info */}
              <div className="flex-grow min-w-0">
                <h3 className="text-base md:text-lg font-medium text-black truncate">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.brand}</p>
                <p className="text-sm text-gray-500 mt-1 hidden sm:block">Product ID: {item.productId}</p>
                <p className="text-sm text-gray-500 mt-1 sm:hidden">ID: {item.productId}</p>
              </div>

              {/* Ask Price */}
              <div className="text-base md:text-lg font-medium text-gray-700 flex-shrink-0 mr-2 md:mr-4">
                ${item.askPrice}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4 flex-shrink-0">
                <button
                  onClick={() => {}}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors underline"
                >
                  Change Ask
                </button>
                <button
                  onClick={() => {}}
                  className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-md text-sm font-medium transition-colors"
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
