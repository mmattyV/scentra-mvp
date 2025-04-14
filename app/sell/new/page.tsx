'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import Header from '@/app/ui/components/Header';

// Static list of fragrances for MVP, each with a unique productId
const FRAGRANCES = [
  { productId: 'frag-001', name: 'Sauvage', brand: 'Dior' },
  { productId: 'frag-002', name: 'Bleu de Chanel', brand: 'Chanel' },
  { productId: 'frag-003', name: 'Aventus', brand: 'Creed' },
  { productId: 'frag-004', name: 'La Nuit de L\'Homme', brand: 'Yves Saint Laurent' },
  { productId: 'frag-005', name: 'Acqua di Gio', brand: 'Giorgio Armani' },
  { productId: 'frag-006', name: 'Eros', brand: 'Versace' },
  { productId: 'frag-007', name: 'The One', brand: 'Dolce & Gabbana' },
  { productId: 'frag-008', name: 'Terre d\'Hermes', brand: 'Hermes' },
  { productId: 'frag-009', name: 'Light Blue', brand: 'Dolce & Gabbana' },
  { productId: 'frag-010', name: 'Black Opium', brand: 'Yves Saint Laurent' },
];

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useAuthenticator((context) => [context.user]);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [fragranceId, setFragranceId] = useState('');
  const [bottleSize, setBottleSize] = useState('');
  const [condition, setCondition] = useState('new');
  const [percentRemaining, setPercentRemaining] = useState(100);
  const [askingPrice, setAskingPrice] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    fragranceId?: string;
    bottleSize?: string;
    askingPrice?: string;
  }>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  const validateBottleSize = (value: string): boolean => {
    // Allow only numbers followed by ml or oz, with optional spaces
    const regex = /^\d+(\.\d+)?\s*(ml|oz)$/i;
    return regex.test(value.trim());
  };

  const validateForm = () => {
    const errors: {
      fragranceId?: string;
      bottleSize?: string;
      askingPrice?: string;
    } = {};

    if (!fragranceId) {
      errors.fragranceId = 'Please select a fragrance';
    }

    if (!bottleSize) {
      errors.bottleSize = 'Please enter bottle size';
    } else if (!validateBottleSize(bottleSize)) {
      errors.bottleSize = 'Please enter a valid size (e.g., 50ml or 3.4oz)';
    }

    if (!askingPrice) {
      errors.askingPrice = 'Please enter an asking price';
    } else if (isNaN(parseFloat(askingPrice)) || parseFloat(askingPrice) <= 0) {
      errors.askingPrice = 'Please enter a valid price';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      const client = generateClient<Schema>();
      
      // Create new listing
      await client.models.Listing.create({
        sellerId: user.userId,
        fragranceId,
        bottleSize,
        condition,
        percentRemaining: condition === 'used' ? percentRemaining : undefined,
        askingPrice: parseFloat(askingPrice),
        createdAt: new Date().toISOString(),
      });
      
      // Redirect to confirmation page
      router.push('/sell/new/confirm');
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render on server to prevent hydration issues
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Create New Listing</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Fragrance Selection */}
            <div className="space-y-2">
              <label htmlFor="fragrance" className="block text-sm font-medium text-gray-700">
                Fragrance
              </label>
              <select
                id="fragrance"
                value={fragranceId}
                onChange={(e) => setFragranceId(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-black focus:outline-none ${
                  validationErrors.fragranceId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a fragrance</option>
                {FRAGRANCES.map((fragrance) => (
                  <option key={fragrance.productId} value={fragrance.productId}>
                    {fragrance.brand} - {fragrance.name}
                  </option>
                ))}
              </select>
              {validationErrors.fragranceId && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.fragranceId}</p>
              )}
            </div>
            
            {/* Bottle Size */}
            <div className="space-y-2">
              <label htmlFor="bottleSize" className="block text-sm font-medium text-gray-700">
                Bottle Size (e.g., 50ml, 3.4oz)
              </label>
              <input
                id="bottleSize"
                type="text"
                value={bottleSize}
                onChange={(e) => setBottleSize(e.target.value)}
                placeholder="Enter bottle size (e.g., 50ml, 3.4oz)"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-black focus:outline-none ${
                  validationErrors.bottleSize ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.bottleSize && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.bottleSize}</p>
              )}
            </div>
            
            {/* Condition */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-700 mb-2">Condition</span>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={condition === 'new'}
                    onChange={() => setCondition('new')}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                  <span>New</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={condition === 'used'}
                    onChange={() => setCondition('used')}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                  <span>Used</span>
                </label>
              </div>
            </div>
            
            {/* Percent Remaining (only if "used" is selected) */}
            {condition === 'used' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="percentRemaining" className="block text-sm font-medium text-gray-700">
                    Percent Remaining
                  </label>
                  <span className="text-sm text-gray-500">{percentRemaining}%</span>
                </div>
                <input
                  id="percentRemaining"
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={percentRemaining}
                  onChange={(e) => setPercentRemaining(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
            
            {/* Asking Price */}
            <div className="space-y-2">
              <label htmlFor="askingPrice" className="block text-sm font-medium text-gray-700">
                Asking Price ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  id="askingPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-7 pr-4 py-2 border rounded-lg focus:ring-1 focus:ring-black focus:outline-none ${
                    validationErrors.askingPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {validationErrors.askingPrice && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.askingPrice}</p>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}