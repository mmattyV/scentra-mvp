'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Header from '../../../components/layout/Header';

interface SizeOption {
  id: string;
  label: string;
  capacity: string;
  basePrice: number;
}

const SAMPLE_SIZES: SizeOption[] = [
  { id: '30ml', label: '30mL', capacity: '30mL', basePrice: 45 },
  { id: '50ml', label: '50mL', capacity: '50mL', basePrice: 85 },
  { id: '100ml', label: '100mL', capacity: '100mL', basePrice: 145 },
  { id: '200ml', label: '200mL', capacity: '200mL', basePrice: 195 }
];

export default function ListingDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fragranceId = searchParams.get('id');

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [condition, setCondition] = useState<'new' | 'used'>('new');
  const [percentage, setPercentage] = useState<number>(100);
  const [marketPrice, setMarketPrice] = useState<number>(0);
  const [askPrice, setAskPrice] = useState<number>(0);

  // Calculate total based on selections
  useEffect(() => {
    if (!selectedSize) return;
    
    const basePrice = SAMPLE_SIZES.find(size => size.id === selectedSize)?.basePrice || 0;
    const conditionMultiplier = condition === 'new' ? 1 : (percentage / 100) * 0.7; // Used items are worth 70% of new
    const calculatedMarketPrice = Math.round(basePrice * conditionMultiplier);
    setMarketPrice(calculatedMarketPrice);
    setAskPrice(calculatedMarketPrice); // Default to market price
  }, [selectedSize, condition, percentage]);

  const handleSellNow = () => {
    router.push('/sell/new/confirm');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">List Your Fragrance</h1>

          {/* Size Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-black mb-4">Size</h2>
            <div className="grid grid-cols-2 gap-4">
              {SAMPLE_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedSize === size.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-black">{size.label}</div>
                  <div className="text-gray-600">${size.basePrice}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Condition Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-black mb-4">Condition</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setCondition('new')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  condition === 'new'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium text-black">New</span>
              </button>
              <button
                onClick={() => setCondition('used')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  condition === 'used'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium text-black">Used</span>
              </button>
            </div>
          </div>

          {/* Percentage Slider (Only for Used) */}
          {condition === 'used' && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-black mb-4">Percentage Full</h2>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="99"
                  value={percentage}
                  onChange={(e) => setPercentage(parseInt(e.target.value))}
                  className="w-full accent-black"
                />
                <div className="text-center font-medium text-gray-600">
                  {percentage}% Full
                </div>
              </div>
            </div>
          )}

          {/* Ask Price Selection */}
          {selectedSize && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-black mb-4">Set Your Ask Price</h2>
              
              {/* Price Recommendations */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setAskPrice(Math.round(marketPrice * 0.9))}
                  className={`p-4 border rounded-lg text-center transition-colors hover:border-gray-300 ${
                    askPrice === Math.round(marketPrice * 0.9) ? 'border-black bg-gray-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-sm text-gray-600 mb-1">Quick Sale</div>
                  <div className="font-medium text-black">${Math.round(marketPrice * 0.9)}</div>
                  <div className="text-sm text-green-600">10% under market</div>
                </button>
                <button
                  onClick={() => setAskPrice(marketPrice)}
                  className={`p-4 border rounded-lg text-center transition-colors hover:border-gray-300 ${
                    askPrice === marketPrice ? 'border-black bg-gray-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-sm text-gray-600 mb-1">Market Price</div>
                  <div className="font-medium text-black">${marketPrice}</div>
                  <div className="text-sm text-blue-600">Recommended</div>
                </button>
                <button
                  onClick={() => setAskPrice(Math.round(marketPrice * 1.1))}
                  className={`p-4 border rounded-lg text-center transition-colors hover:border-gray-300 ${
                    askPrice === Math.round(marketPrice * 1.1) ? 'border-black bg-gray-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-sm text-gray-600 mb-1">Premium</div>
                  <div className="font-medium text-black">${Math.round(marketPrice * 1.1)}</div>
                  <div className="text-sm text-purple-600">10% over market</div>
                </button>
              </div>

              {/* Custom Price Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Or enter custom price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={askPrice}
                    onChange={(e) => setAskPrice(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary and Sell Button */}
          <div className="mt-12 space-y-4">
            <div className="flex justify-between items-center py-4 border-t border-b">
              <span className="text-lg font-medium text-black">Your Ask Price</span>
              <span className="text-2xl font-bold text-black">${askPrice}</span>
            </div>
            <button
              onClick={handleSellNow}
              disabled={!selectedSize || askPrice <= 0}
              className="w-full px-8 py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Sell Now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
