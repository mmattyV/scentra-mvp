'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { FRAGRANCES, Fragrance } from '@/app/utils/fragrance-data';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { Listing, SaleStatus, SaleItem } from '@/app/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/app/types';
import { updateListingWithStatusSync } from '@/app/utils/listingStatusSync';

// Ensure FRAGRANCES is treated as an array of Fragrance objects
const fragrancesArray: Fragrance[] = Array.isArray(FRAGRANCES) ? FRAGRANCES : [];

export default function SalesPage() {
  const router = useRouter();
  const { user } = useAuthenticator((context) => [context.user]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  
  // For confirmation handling
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // For tracking unconfirmed sales count
  const [unconfirmedCount, setUnconfirmedCount] = useState(0);

  // For shipping instructions popup
  const [showShippingInstructions, setShowShippingInstructions] = useState(false);
  const [confirmingItem, setConfirmingItem] = useState<SaleItem | null>(null);
  
  // Payment preferences state
  const [showPaymentPreferences, setShowPaymentPreferences] = useState(false);
  const [preferredMethod, setPreferredMethod] = useState<'paypal' | 'venmo'>('paypal');
  const [paymentHandle, setPaymentHandle] = useState('');
  const [isLoadingPaymentPreferences, setIsLoadingPaymentPreferences] = useState(false);
  const [isSavingPaymentPreferences, setIsSavingPaymentPreferences] = useState(false);
  const [paymentPreferenceError, setPaymentPreferenceError] = useState<string | null>(null);
  const [paymentPreferenceId, setPaymentPreferenceId] = useState<string | null>(null);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Enhanced authentication check with retry capability
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
  
  // Separate auth check for image loading
  const [imageAuthAttempts, setImageAuthAttempts] = useState(0);
  const MAX_AUTH_ATTEMPTS = 5;
  
  useEffect(() => {
    // Only run if we have sales but no images
    if (!isClient || imageAuthAttempts >= MAX_AUTH_ATTEMPTS || Object.keys(imageUrls).length > 0 || !user) return;
    
    if (sales.length > 0 && Object.keys(imageUrls).length === 0) {
      // Implement exponential backoff for retries (500ms, 1s, 2s, 4s, 8s)
      const backoffTime = Math.min(8000, 500 * Math.pow(2, imageAuthAttempts));
      
      console.log(`Scheduling image auth attempt ${imageAuthAttempts + 1}/${MAX_AUTH_ATTEMPTS} in ${backoffTime}ms`);
      
      const timer = setTimeout(() => {
        console.log(`Executing image auth attempt ${imageAuthAttempts + 1}/${MAX_AUTH_ATTEMPTS}`);
        setImageAuthAttempts(prev => prev + 1);
        
        // Force a re-fetch of the auth session before trying to load images
        fetchAuthSession().then(() => {
          fetchSaleImages(sales);
        }).catch(err => {
          console.error('Authentication session refresh failed:', err);
        });
      }, backoffTime);
      
      return () => clearTimeout(timer);
    }
  }, [isClient, sales, imageUrls, user, imageAuthAttempts]);
  
  useEffect(() => {
    if (isClient && isAuthReady && user) {
      fetchSales();
    } else if (isClient && isAuthReady && !user) {
      setIsLoading(false);
      setError('Authentication required. Please sign in to view your sales.');
    }
  }, [isClient, isAuthReady, user]);

  // Fetch payment preferences when toggle is clicked
  useEffect(() => {
    if (showPaymentPreferences && user) {
      fetchPaymentPreferences();
    }
  }, [showPaymentPreferences, user]);

  const fetchPaymentPreferences = async () => {
    if (!user?.userId) return;
    
    try {
      setIsLoadingPaymentPreferences(true);
      setPaymentPreferenceError(null);
      
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
        setPaymentPreferenceId(preference.id);
      } else {
        // No existing preferences found
        setPreferredMethod('paypal');
        setPaymentHandle('');
        setPaymentPreferenceId(null);
      }
    } catch (error) {
      console.error('Error fetching payment preferences:', error);
      setPaymentPreferenceError('Failed to load payment preferences. Please try again.');
    } finally {
      setIsLoadingPaymentPreferences(false);
    }
  };

  const handleSavePaymentPreferences = async () => {
    if (!user?.userId || !paymentHandle.trim()) {
      setPaymentPreferenceError('Please enter your payment handle');
      return;
    }
    
    try {
      setIsSavingPaymentPreferences(true);
      setPaymentPreferenceError(null);
      
      const client = generateClient<Schema>({
        authMode: 'userPool'
      });
      
      if (paymentPreferenceId) {
        // Update existing preference
        await client.models.SellerPaymentPreference.update({
          id: paymentPreferenceId,
          preferredMethod,
          paymentHandle,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create new preference
        const result = await client.models.SellerPaymentPreference.create({
          sellerId: user.userId,
          preferredMethod,
          paymentHandle,
          updatedAt: new Date().toISOString()
        });
        
        // Set the ID from the result data object
        if (result.data) {
          setPaymentPreferenceId(result.data.id);
        }
      }
      
      // Success notification and close form
      alert('Payment preferences saved successfully!');
      setShowPaymentPreferences(false);
    } catch (error) {
      console.error('Error saving payment preferences:', error);
      setPaymentPreferenceError('Failed to save payment preferences. Please try again.');
    } finally {
      setIsSavingPaymentPreferences(false);
    }
  };

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const client = generateClient<Schema>({
        authMode: 'userPool' // Explicitly use Cognito User Pool for auth
      });
      
      // Make sure user is defined before proceeding
      if (!user?.userId) {
        setError('Authentication required. Please sign in to view your sales.');
        setIsLoading(false);
        return;
      }
      
      // Fetch listings where sellerId matches the current user and status is NOT 'active' (sold items)
      const { data } = await client.models.Listing.list({
        filter: {
          sellerId: { eq: user.userId },
          status: { ne: 'active' }, // Get all non-active listings (sold or in other states)
          and: [
            { status: { ne: 'removed' } } // Exclude removed listings
          ]
        }
      });
      
      // Ensure we have data before assigning it
      const salesData = Array.isArray(data) ? data as unknown as SaleItem[] : [];
      setSales(salesData);
      
      // Count unconfirmed sales
      const unconfirmedSales = salesData.filter(item => item.status === 'unconfirmed');
      setUnconfirmedCount(unconfirmedSales.length);
      
      // Fetch images for all sales
      if (data && data.length > 0) {
        fetchSaleImages(data as unknown as SaleItem[]);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError('Failed to load your sales. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch image URLs from Amplify Storage
  const fetchSaleImages = async (items: SaleItem[]) => {
    try {
      // Skip if no items
      if (!Array.isArray(items) || items.length === 0) return;
      
      // Do a fresh auth check right before getting image URLs
      try {
        const authResult = await fetchAuthSession();
        // Check if we have a valid token
        if (!authResult.tokens?.accessToken) {
          console.log('Auth tokens not available yet, will retry...');
          return;
        }
      } catch (error) {
        console.error('Auth check failed before image fetch:', error);
        return;
      }
      
      const { getUrl } = await import('aws-amplify/storage');
      const urls: Record<string, string> = {};
      
      // Process each item to get its image URL
      await Promise.all(
        items.map(async (item) => {
          // Skip if item is invalid or missing imageKey
          if (!item?.id || !item?.imageKey) return;
          
          try {
            const result = await getUrl({
              path: item.imageKey,
              options: {
                expiresIn: 3600 // URL expiration time in seconds
              }
            });
            urls[item.id] = result.url.toString();
          } catch (error) {
            console.error(`Error fetching image for sale item ${item.id}:`, error);
            // Use a default/placeholder image on error
            urls[item.id] = '/placeholder-fragrance.jpg';
          }
        })
      );
      
      setImageUrls(urls);
    } catch (error) {
      console.error('Error fetching image URLs:', error);
    }
  };

  const handleConfirmClick = (item: SaleItem) => {
    setConfirmingItem(item);
    setShowConfirmation(item.id);
  };

  const handleConfirm = async () => {
    if (!confirmingItem) return;
    
    try {
      setIsConfirming(true);
      
      // Use the status sync utility to ensure related order items are also updated
      await updateListingWithStatusSync(confirmingItem.id, 'shipping_to_scentra', 'userPool');
      
      // Update local state
      setSales(prev => 
        prev.map(item => 
          item.id === confirmingItem.id 
            ? { ...item, status: 'shipping_to_scentra' } 
            : item
        )
      );
      
      // Show shipping instructions
      setShowConfirmation(null);
      setShowShippingInstructions(true);
    } catch (error) {
      console.error('Error confirming sale:', error);
      alert('Failed to confirm sale. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const closeShippingInstructions = () => {
    setShowShippingInstructions(false);
    setConfirmingItem(null);
  };

  // Find fragrance details by productId
  const getFragranceDetails = (fragranceId: string) => {
    if (!fragranceId) return { name: 'Unknown Fragrance', brand: 'Unknown Brand' };
    
    return fragrancesArray.find((f: { productId: string; name: string; brand: string }) => f.productId === fragranceId) || { 
      name: 'Unknown Fragrance', 
      brand: 'Unknown Brand' 
    };
  };

  // Render redirect if no user after auth check is completed
  if (isClient && isAuthReady && !user) {
    router.push('/auth');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Please sign in to view your sales.</p>
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

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Your Sales</h1>
            <button
              onClick={() => setShowPaymentPreferences(!showPaymentPreferences)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              {showPaymentPreferences ? 'Hide Payment Settings' : 'Update Payment Settings'}
            </button>
          </div>
          
          {/* Unconfirmed Sales Warning */}
          {unconfirmedCount > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Action Required</h3>
                  <div className="mt-1 text-sm text-amber-700">
                    <p>You have {unconfirmedCount} unconfirmed {unconfirmedCount === 1 ? 'sale' : 'sales'}. Please review and confirm {unconfirmedCount === 1 ? 'it' : 'them'} to proceed with shipping and receive payment.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Payment Preferences Form */}
          {showPaymentPreferences && (
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8 border border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Payment Preferences</h2>
              
              {isLoadingPaymentPreferences ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-900 border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Preferred Payment Method
                    </label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={preferredMethod === 'paypal'}
                          onChange={() => setPreferredMethod('paypal')}
                          className="h-5 w-5 text-black focus:ring-black border-gray-300"
                          disabled={isSavingPaymentPreferences}
                        />
                        <span className="text-base">PayPal</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={preferredMethod === 'venmo'}
                          onChange={() => setPreferredMethod('venmo')}
                          className="h-5 w-5 text-black focus:ring-black border-gray-300"
                          disabled={isSavingPaymentPreferences}
                        />
                        <span className="text-base">Venmo</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="paymentHandle" className="block text-sm font-medium text-gray-700">
                      {preferredMethod === 'paypal' ? 'PayPal Email or Username' : 'Venmo Username'}
                    </label>
                    <input
                      id="paymentHandle"
                      type="text"
                      value={paymentHandle}
                      onChange={(e) => setPaymentHandle(e.target.value)}
                      placeholder={preferredMethod === 'paypal' ? 'Enter your PayPal email or username' : 'Enter your Venmo username (without @)'}
                      className="w-full px-4 py-3 sm:py-2 border rounded-lg focus:ring-1 focus:ring-black focus:outline-none border-gray-300 text-base sm:text-sm"
                      disabled={isSavingPaymentPreferences}
                    />
                  </div>
                  
                  {paymentPreferenceError && (
                    <div className="text-red-500 text-sm mt-2">{paymentPreferenceError}</div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPaymentPreferences(false)}
                      className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 sm:py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      disabled={isSavingPaymentPreferences}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePaymentPreferences}
                      disabled={isSavingPaymentPreferences || !paymentHandle.trim()}
                      className={`w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 sm:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none ${
                        isSavingPaymentPreferences || !paymentHandle.trim() ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSavingPaymentPreferences ? 'Saving...' : 'Save Payment Preferences'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div>
            </div>
          ) : sales.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sales yet</h3>
              <p className="text-gray-500 mb-6">When you sell items, they will appear here.</p>
              <button
                onClick={() => router.push('/sell/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none"
              >
                Create a New Listing
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {sales.map((item) => {
                  const fragrance = getFragranceDetails(item.fragranceId);
                  return (
                    <li key={item.id} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-shrink-0 relative h-20 w-20 sm:h-16 sm:w-16 rounded-md overflow-hidden">
                          {imageUrls[item.id] ? (
                            <>
                              <div 
                                className={`absolute inset-0 bg-gray-200 flex items-center justify-center transition-opacity duration-200 ${loadedImages[item.id] ? 'opacity-0' : 'opacity-100'}`}
                              >
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="animate-pulse w-full h-full bg-gray-300"></div>
                                </div>
                              </div>
                              <Image
                                src={imageUrls[item.id]}
                                alt={fragrance.name}
                                fill
                                style={{ objectFit: 'cover' }}
                                onLoad={() => setLoadedImages(prev => ({ ...prev, [item.id]: true }))}
                              />
                            </>
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                              <div className="animate-pulse w-full h-full bg-gray-300"></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-base sm:text-sm font-medium text-gray-900 truncate">
                            {fragrance.brand} - {fragrance.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {item.bottleSize} • {item.condition === 'new' ? 'New' : `Used (${item.percentRemaining}% remaining)`}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {item.hasOriginalBox ? 'With original box' : 'No original box'}
                          </p>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status as SaleStatus] || 'bg-gray-100 text-gray-800'}`}>
                              {STATUS_LABELS[item.status as SaleStatus] || item.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end sm:text-right mt-2 sm:mt-0">
                          <p className="text-base sm:text-sm font-semibold text-gray-900">${parseFloat(item.askingPrice.toString()).toFixed(2)}</p>
                          
                          {/* Action buttons based on status */}
                          {item.status === 'unconfirmed' && !showConfirmation && (
                            <button
                              onClick={() => handleConfirmClick(item)}
                              className="mt-1 text-xs inline-flex items-center px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:outline-none"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              Confirm Sale
                            </button>
                          )}
                          
                          {/* Confirmation dialog */}
                          {showConfirmation === item.id && (
                            <div className="mt-2 text-xs w-full sm:w-auto">
                              <p className="mb-1 text-gray-700">Confirm this sale?</p>
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleConfirm}
                                  disabled={isConfirming}
                                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                  {isConfirming ? '...' : 'Yes'}
                                </button>
                                <button
                                  onClick={() => setShowConfirmation(null)}
                                  disabled={isConfirming}
                                  className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </main>
      
      {/* Shipping Instructions Modal */}
      {showShippingInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Shipping Instructions</h3>
              <div className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Sale Confirmed
              </div>
            </div>
            
            <div className="prose prose-sm">
              <p className="font-medium text-gray-700">Thank you for confirming your sale! Please follow these steps to ship your item to Scentra:</p>
              
              <div className="bg-amber-50 border-l-4 border-amber-400 p-3 my-4">
                <p className="text-amber-700 font-medium">Important: Ship your item within 3 business days to avoid cancellation.</p>
              </div>
              
              <ol className="list-decimal pl-5 space-y-3 my-4">
                <li>Package your fragrance securely with bubble wrap or similar padding.</li>
                <li>Include the original box if possible.</li>
                <li>Place it in a sturdy box to prevent damage during shipping.</li>
                <li>Print a shipping label addressed to our verification center.</li>
                <li>Ship via USPS, UPS, or FedEx with tracking.</li>
                <li>Email your tracking number to <span className="font-medium">contact@scentra.app</span> with your order ID.</li>
              </ol>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
                <p className="font-semibold mb-1">Shipping Address:</p>
                <p className="font-medium">
                  Scentra<br />
                  1770 Mass Ave.<br />
                  #198<br />
                  Cambridge, MA 02140
                </p>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">We'll notify you once we receive and verify your item. Payment will be processed to your preferred payment method after verification is complete, typically within 1-2 business days.</p>
              
              <p className="text-sm font-medium">Order Reference: {confirmingItem?.id.substring(0, 8)}</p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeShippingInstructions}
                className="px-4 py-2.5 sm:py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none"
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