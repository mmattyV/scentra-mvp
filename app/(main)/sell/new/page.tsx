'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { uploadData, getUrl } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import Image from 'next/image';
import { FRAGRANCES, Fragrance } from '@/app/utils/fragrance-data';
import { fetchAuthSession } from 'aws-amplify/auth';

// Ensure FRAGRANCES is treated as an array of Fragrance objects
const fragrancesArray: Fragrance[] = Array.isArray(FRAGRANCES) ? FRAGRANCES : [];

// Amplify is now configured at the root level in AuthenticatorProvider

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useAuthenticator((context) => [context.user]);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Modal state
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isHowItWorksModalOpen, setIsHowItWorksModalOpen] = useState(false);
  
  // Form state
  const [fragranceId, setFragranceId] = useState('');
  const [bottleSize, setBottleSize] = useState('');
  const [condition, setCondition] = useState('new');
  const [percentRemaining, setPercentRemaining] = useState(100);
  const [hasOriginalBox, setHasOriginalBox] = useState(false);
  const [batchCode, setBatchCode] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  
  // Search and fragrance selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFragrances, setFilteredFragrances] = useState<Fragrance[]>(fragrancesArray.slice(0, 50));
  const [isFragranceDropdownOpen, setIsFragranceDropdownOpen] = useState(false);
  const [selectedFragrance, setSelectedFragrance] = useState<Fragrance | null>(null);
  const fragranceDropdownRef = useRef<HTMLDivElement>(null);
  
  // Payment method state
  const [preferredMethod, setPreferredMethod] = useState<'paypal' | 'venmo'>('paypal');
  const [paymentHandle, setPaymentHandle] = useState('');
  const [hasExistingPaymentPreference, setHasExistingPaymentPreference] = useState(false);
  const [isLoadingPaymentPreferences, setIsLoadingPaymentPreferences] = useState(true);
  
  const [validationErrors, setValidationErrors] = useState<{
    fragranceId?: string;
    bottleSize?: string;
    askingPrice?: string;
    image?: string;
    paymentHandle?: string;
  }>({});

  // Image handling state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Add explicit auth check effect
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!isClient) return;
      
      try {
        // This will force Amplify to check storage for auth state
        await fetchAuthSession();
        setIsAuthReady(true);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthReady(true); // Still set to true so we don't block rendering
      }
    };
    
    checkAuthStatus();
  }, [isClient]);

  // Fetch existing payment preferences
  useEffect(() => {
    const fetchPaymentPreferences = async () => {
      if (!isClient || !isAuthReady || !user) return;
      
      try {
        setIsLoadingPaymentPreferences(true);
        const client = generateClient<Schema>({
          authMode: 'userPool'
        });
        
        const { data } = await client.models.SellerPaymentPreference.list({
          filter: {
            sellerId: { eq: user.userId }
          }
        });
        
        if (data && data.length > 0) {
          const preference = data[0];
          setPreferredMethod(preference.preferredMethod as 'paypal' | 'venmo');
          setPaymentHandle(preference.paymentHandle);
          setHasExistingPaymentPreference(true);
        }
      } catch (error) {
        console.error('Error fetching payment preferences:', error);
      } finally {
        setIsLoadingPaymentPreferences(false);
      }
    };
    
    fetchPaymentPreferences();
  }, [isClient, isAuthReady, user]);

  // Add click outside handler for fragrance dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fragranceDropdownRef.current && !fragranceDropdownRef.current.contains(event.target as Node)) {
        setIsFragranceDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter fragrances based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFragrances(fragrancesArray.slice(0, 50));
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = fragrancesArray.filter(
      fragrance => 
        fragrance.name.toLowerCase().includes(query) || 
        fragrance.brand.toLowerCase().includes(query)
    ).slice(0, 100); // Limit to 100 results for performance

    setFilteredFragrances(filtered);
  }, [searchQuery]);

  // Handle fragrance selection
  const handleSelectFragrance = (fragrance: Fragrance) => {
    setFragranceId(fragrance.productId);
    setSelectedFragrance(fragrance);
    setIsFragranceDropdownOpen(false);
    
    // Clear fragrance validation error if any
    if (validationErrors.fragranceId) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.fragranceId;
        return newErrors;
      });
    }
  };

  // Render redirect if no user after auth check is completed
  if (isClient && isAuthReady && !user) {
    router.push('/auth');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Please sign in to create a listing.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }
  
  // Don't render content until client-side rendering and auth check are complete
  if (!isClient || !isAuthReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

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
      paymentHandle?: string;
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
    
    if (!paymentHandle) {
      errors.paymentHandle = 'Please enter your payment handle';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedImage) return;
    
    try {
      setIsSubmitting(true);
      
      // Generate a unique path for the image
      const timestamp = new Date().getTime();
      const fileExtension = selectedImage.name.split('.').pop() || 'jpg';
      const s3Path = `listings/${fragranceId}/${timestamp}-frag.${fileExtension}`;
      
      // Use FileReader to convert the file to an ArrayBuffer
      const uploadPromise = new Promise<string>((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(selectedImage);
        
        fileReader.onload = async (event) => {
          try {
            if (!event.target?.result) {
              throw new Error('Failed to read file');
            }
            
            console.log("File read successfully!");
            
            // Upload the file using the ArrayBuffer
            const result = await uploadData({
              data: event.target.result,
              path: s3Path
            });
            
            console.log("Upload successful:", result);
            
            // DEBUG: Get and log the public URL of the uploaded image
            try {
              const urlResult = await getUrl({
                path: s3Path
              });
              console.log("Image public URL:", urlResult.url.toString());
            } catch (urlError) {
              console.error("Error getting image URL:", urlError);
            }
            
            resolve(s3Path);
          } catch (error) {
            console.error("Upload error:", error);
            reject(error);
          }
        };
        
        fileReader.onerror = (error) => {
          console.error("FileReader error:", error);
          reject(error);
        };
      });
      
      // Wait for the upload to complete
      const imageKey = await uploadPromise;
      
      // Optional: Log the successful upload
      await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          key: imageKey
        }),
      });
      
      // Create or update the seller payment preference
      const client = generateClient<Schema>({
        authMode: 'userPool'
      });
      
      // Save or update payment preferences
      if (hasExistingPaymentPreference) {
        // Get existing preference to update
        const { data: existingPrefs } = await client.models.SellerPaymentPreference.list({
          filter: { sellerId: { eq: user.userId } }
        });
        
        if (existingPrefs && existingPrefs.length > 0) {
          await client.models.SellerPaymentPreference.update({
            id: existingPrefs[0].id,
            preferredMethod,
            paymentHandle,
            updatedAt: new Date().toISOString()
          });
        } else {
          // Create new if couldn't find the existing one
          await client.models.SellerPaymentPreference.create({
            sellerId: user.userId,
            preferredMethod,
            paymentHandle,
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        // Create new preference
        await client.models.SellerPaymentPreference.create({
          sellerId: user.userId,
          preferredMethod,
          paymentHandle,
          updatedAt: new Date().toISOString()
        });
      }
      
      // Create the listing with the image key - specify userPool auth mode
      await client.models.Listing.create({
        sellerId: user.userId,
        fragranceId,
        bottleSize,
        condition,
        percentRemaining: condition === 'used' ? percentRemaining : undefined,
        hasOriginalBox,
        batchCode: batchCode || undefined, // Only include if provided
        askingPrice: parseFloat(askingPrice),
        imageKey: imageKey,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      // Redirect to confirmation page
      router.push('/sell/new/confirm');
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Create New Listing</h1>
          
          {/* Seller Information Links */}
          <div className="mb-6 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
            <button 
              type="button"
              onClick={() => setIsTermsModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Terms of Selling
            </button>
            <button 
              type="button"
              onClick={() => setIsHowItWorksModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              How Selling Works
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Fragrance Selection */}
            <div className="space-y-2">
              <label htmlFor="fragrance" className="block text-sm font-medium text-gray-700">
                Fragrance
              </label>
              <div className="relative">
                <input
                  id="fragrance"
                  type="search"
                  value={selectedFragrance ? `${selectedFragrance.brand} - ${selectedFragrance.name}` : searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedFragrance(null);
                    setFragranceId('');
                    setIsFragranceDropdownOpen(true);
                  }}
                  onClick={() => setIsFragranceDropdownOpen(true)}
                  placeholder="Search for a fragrance"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-black focus:outline-none ${
                    validationErrors.fragranceId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-label="Search for a fragrance by name or brand"
                />
                <button
                  type="button"
                  onClick={() => setIsFragranceDropdownOpen(!isFragranceDropdownOpen)}
                  className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
                  aria-label={isFragranceDropdownOpen ? "Close fragrance list" : "Open fragrance list"}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isFragranceDropdownOpen && (
                  <div
                    ref={fragranceDropdownRef}
                    className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-60 overflow-y-auto"
                  >
                    {filteredFragrances.length > 0 ? (
                      filteredFragrances.map((fragrance) => (
                        <button
                          key={fragrance.productId}
                          type="button"
                          onClick={() => handleSelectFragrance(fragrance)}
                          className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="font-medium">{fragrance.brand}</span> - {fragrance.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No fragrances found. Try a different search term.
                      </div>
                    )}
                  </div>
                )}
              </div>
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
            
            {/* Original Box */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasOriginalBox}
                  onChange={(e) => setHasOriginalBox(e.target.checked)}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Includes Original Box</span>
              </label>
            </div>
            
            {/* Batch Code */}
            <div className="space-y-2">
              <label htmlFor="batchCode" className="block text-sm font-medium text-gray-700">
                Batch Code
              </label>
              <input
                id="batchCode"
                type="text"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                placeholder="Enter batch code"
                className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-black focus:outline-none border-gray-300"
              />
            </div>
            
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
                      Upload a high-quality photo of the front of your bottle. Include the original box in the image if possible.
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
            </div>
            
            {/* Payment Method Section */}
            <div className="space-y-2 border-t pt-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {hasExistingPaymentPreference 
                  ? 'Your Payment Information' 
                  : 'Set Your Payment Information'}
              </h2>
              
              {isLoadingPaymentPreferences ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-900 border-t-transparent"></div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-700 mb-2">Preferred Payment Method</span>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={preferredMethod === 'paypal'}
                          onChange={() => setPreferredMethod('paypal')}
                          className="h-4 w-4 text-black focus:ring-black border-gray-300"
                        />
                        <span>PayPal</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={preferredMethod === 'venmo'}
                          onChange={() => setPreferredMethod('venmo')}
                          className="h-4 w-4 text-black focus:ring-black border-gray-300"
                        />
                        <span>Venmo</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <label htmlFor="paymentHandle" className="block text-sm font-medium text-gray-700">
                      {preferredMethod === 'paypal' ? 'PayPal Email or Username' : 'Venmo Username'}
                    </label>
                    <input
                      id="paymentHandle"
                      type="text"
                      value={paymentHandle}
                      onChange={(e) => setPaymentHandle(e.target.value)}
                      placeholder={preferredMethod === 'paypal' ? 'Enter your PayPal email or username' : 'Enter your Venmo username (without @)'}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-black focus:outline-none ${
                        validationErrors.paymentHandle ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.paymentHandle && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.paymentHandle}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {hasExistingPaymentPreference 
                        ? 'Your payment information will be updated with this submission' 
                        : 'Your payment information will be saved for future listings'}
                    </p>
                  </div>
                </>
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
              <p className="text-sm text-gray-600 mt-1">
                Note: You must cover the cost of shipping to our Verification Center. Please price your product accordingly.
              </p>
              <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
                <p className="font-semibold mb-1">Shipping Address:</p>
                <p className="font-medium">
                  Scentra<br />
                  1770 Mass Ave.<br />
                  #198<br />
                  Cambridge, MA 02140
                </p>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <p className="text-sm text-gray-600 mb-4 text-center">
                By creating this listing, you agree to the <button 
                  type="button" 
                  className="text-blue-600 hover:underline"
                  onClick={() => setIsTermsModalOpen(true)}
                >
                  Terms of Service
                </button>
              </p>
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

      {/* Terms of Selling Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Terms of Selling on Scentra</h2>
              <button 
                onClick={() => setIsTermsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="mb-4">By listing a fragrance on Scentra, you agree to the following terms:</p>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Authenticity Required</h3>
                <p>You may only list 100% authentic products. Counterfeit or misrepresented items are strictly prohibited and will result in account suspension.</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Accurate Descriptions</h3>
                <p>You must provide honest, detailed, and accurate information about your fragrance, including condition, size, and image.</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Timely Shipping</h3>
                <p>Once a sale is confirmed, you must ship your fragrance to our verification center <strong>as soon as possible</strong>.</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Verification Required for Payment</h3>
                <p>Scentra will release payment only after your fragrance has been authenticated and confirmed to match your listing.</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Scentra's Right to Refuse</h3>
                <p>Scentra reserves the right to reject or return any item that fails verification, appears damaged, or differs from the listing in material ways.</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Final Sales</h3>
                <p>Once a buyer's payment is processed and the item passes authentication, all sales are final.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How Selling Works Modal */}
      {isHowItWorksModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Selling: How Does It Work?</h2>
              <button 
                onClick={() => setIsHowItWorksModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="prose prose-sm max-w-none">
              <ol className="list-none space-y-6">
                <li className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-black text-white rounded-full font-bold mr-3">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Create a Listing</h3>
                    <p>Add all required details—brand, size, condition, image, and payment details.</p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-black text-white rounded-full font-bold mr-3">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Publish Your Listing</h3>
                    <p>Once published, your fragrance becomes visible to buyers on Scentra.</p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-black text-white rounded-full font-bold mr-3">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Order Placed</h3>
                    <p>When a buyer purchases your fragrance, the listing is placed <strong>on hold</strong> while payment is processed.</p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-black text-white rounded-full font-bold mr-3">4</div>
                  <div>
                    <h3 className="font-semibold mb-1">Confirm the Sale</h3>
                    <p>Once the payment is processed, you'll be prompted to confirm the order from your <strong>Sales page</strong>.</p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-black text-white rounded-full font-bold mr-3">5</div>
                  <div>
                    <h3 className="font-semibold mb-1">Ship to Scentra</h3>
                    <p>
                      After confirmation, securely ship your fragrance to our Verification Center.
                      <br />
                      📩 Email your tracking number and order ID to <strong>contact@scentra.app</strong>.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-black text-white rounded-full font-bold mr-3">6</div>
                  <div>
                    <h3 className="font-semibold mb-1">Verification & Payout</h3>
                    <p>
                      Our team authenticates your item and checks that it matches your listing.
                      <br />
                      Once verified, you'll receive payment to your preferred method—typically within 1–2 business days.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsHowItWorksModalOpen(false)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}