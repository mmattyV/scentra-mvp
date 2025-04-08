'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';

interface Fragrance {
  id: number;
  name: string;
  brand: string;
  image: string;
}

const SAMPLE_FRAGRANCES: Fragrance[] = [
  {
    id: 1,
    name: 'Bleu de Chanel',
    brand: 'CHANEL',
    image: '/fragrances/bleu.jpg'
  },
  {
    id: 2,
    name: 'Sauvage',
    brand: 'Dior',
    image: '/fragrances/sauvage.jpg'
  },
  {
    id: 3,
    name: 'Aventus',
    brand: 'Creed',
    image: '/fragrances/aventus.jpg'
  },
  {
    id: 4,
    name: 'Y Eau de Parfum',
    brand: 'YSL',
    image: '/fragrances/y.jpg'
  },
  {
    id: 5,
    name: 'Light Blue',
    brand: 'Dolce & Gabbana',
    image: '/fragrances/light-blue.jpg'
  },
  {
    id: 6,
    name: 'Acqua di Gio',
    brand: 'Giorgio Armani',
    image: '/fragrances/acqua.jpg'
  }
];

export default function NewListingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  const filteredFragrances = SAMPLE_FRAGRANCES.filter(fragrance => {
    const query = searchQuery.toLowerCase();
    return (
      fragrance.name.toLowerCase().includes(query) ||
      fragrance.brand.toLowerCase().includes(query)
    );
  });

  const handleSelectFragrance = (fragranceId: number) => {
    // In a real app, this would pass the selected fragrance data
    router.push(`/sell/new/details?id=${fragranceId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Create New Listing</h1>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search product or brand"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-500 text-gray-900"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Fragrances Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {filteredFragrances.map((fragrance) => (
            <button
              key={fragrance.id}
              onClick={() => handleSelectFragrance(fragrance.id)}
              className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow text-left"
            >
              <div className="relative w-full aspect-square mb-4">
                <Image
                  src={fragrance.image}
                  alt={fragrance.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <h3 className="font-medium text-black">{fragrance.name}</h3>
              <p className="text-gray-600">{fragrance.brand}</p>
            </button>
          ))}
        </div>

        {/* Terms Link */}
        <div className="text-center">
          <button
            onClick={() => setShowTerms(true)}
            className="font-bold text-gray-700 hover:text-black transition-colors"
          >
            Terms and conditions of selling
          </button>
        </div>

        {/* Terms Modal */}
        {showTerms && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">Terms and Conditions</h2>
                <button
                  onClick={() => setShowTerms(false)}
                  className="text-gray-500 hover:text-black"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-gray-600">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <p className="mt-4">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
