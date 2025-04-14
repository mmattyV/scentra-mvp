'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import Image from 'next/image';

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

// Maximum image dimensions for compression
const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 1200;
const IMAGE_QUALITY = 0.7; // JPEG compression quality (0-1)

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
    image?: string;
  }>({});

  // Image handling state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Compress the image using canvas
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      setIsCompressing(true);
      // Create HTML Image element with proper typings
      const img: HTMLImageElement = document.createElement('img');
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_IMAGE_WIDTH) {
          height = (MAX_IMAGE_WIDTH / width) * height;
          width = MAX_IMAGE_WIDTH;
        }
        
        if (height > MAX_IMAGE_HEIGHT) {
          width = (MAX_IMAGE_HEIGHT / height) * width;
          height = MAX_IMAGE_HEIGHT;
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          setIsCompressing(false);
          reject(new Error('Unable to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setIsCompressing(false);
              resolve(blob);
            } else {
              setIsCompressing(false);
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          IMAGE_QUALITY
        );
      };
      
      img.onerror = () => {
        setIsCompressing(false);
        reject(new Error('Image loading failed'));
      };
    });
  };

  // Handle image selection
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const file = files[0];
        
        // Only accept images
        if (!file.type.startsWith('image/')) {
          setValidationErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
          return;
        }
        
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
        // Clear the image validation error
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      } catch (error) {
        console.error('Error handling image:', error);
        setValidationErrors(prev => ({ ...prev, image: 'Error processing image' }));
      }
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      image?: string;
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
    
    if (!selectedImage) {
      errors.image = 'Please upload a product image';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedImage) return;
    
    try {
      setIsSubmitting(true);
      
      // 1. Compress the image
      const compressedImage = await compressImage(selectedImage);
      
      // 2. Generate a unique filename
      const timestamp = new Date().getTime();
      const fileExtension = selectedImage.name.split('.').pop() || 'jpg';
      const fileName = `listings/${user.userId}/${timestamp}-${fragranceId}.${fileExtension}`;
      
      // 3. Upload to S3
      const { result } = await uploadData({
        key: fileName,
        data: compressedImage,
        options: {
          contentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
          accessLevel: 'guest', // Public read access for listing images
        }
      });
      
      // 4. Create the listing with the image key
      const client = generateClient<Schema>();
      await client.models.Listing.create({
        sellerId: user.userId,
        fragranceId,
        bottleSize,
        condition,
        percentRemaining: condition === 'used' ? percentRemaining : undefined,
        askingPrice: parseFloat(askingPrice),
        imageKey: fileName, // Store S3 key reference
        createdAt: new Date().toISOString(),
      });
      
      // Redirect to confirmation page
      router.push('/sell/new/confirm');
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
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
            
            {/* Image Upload */}
            <div className="space-y-2">
              <label htmlFor="productImage" className="block text-sm font-medium text-gray-700">
                Product Image
              </label>
              <div 
                className={`border-2 border-dashed rounded-lg p-4 ${
                  validationErrors.image ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {!imagePreview ? (
                  <div className="text-center py-6">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-1 text-sm text-gray-500">
                      Upload a high-quality photo of your product
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="productImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none"
                    >
                      Select Image
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative h-64 w-full overflow-hidden rounded-lg">
                      <Image
                        src={imagePreview}
                        alt="Product preview"
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-gray-100 rounded-full shadow"
                    >
                      <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {validationErrors.image && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.image}</p>
              )}
              {isCompressing && (
                <p className="text-blue-500 text-sm mt-1">Compressing image...</p>
              )}
            </div>
            
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
                disabled={isSubmitting || isCompressing}
                className={`w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors ${
                  (isSubmitting || isCompressing) ? 'opacity-70 cursor-not-allowed' : ''
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