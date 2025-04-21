'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { FRAGRANCES } from '@/app/utils/fragrance-data';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { Listing } from '@/app/types';

export default function CurrentListingsPage() {
  const router = useRouter();
  const { user } = useAuthenticator((context) => [context.user]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // For price editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [isPriceUpdating, setIsPriceUpdating] = useState(false);
  
  // For deletion
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add an explicit auth check effect
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

  useEffect(() => {
    if (isClient && isAuthReady && user) {
      fetchListings();
    } else if (isClient && isAuthReady && !user) {
      // If authentication check completed but no user found
      setIsLoading(false);
      setError('Authentication required. Please sign in to view your listings.');
    }
  }, [isClient, isAuthReady, user]);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const client = generateClient<Schema>({
        authMode: 'userPool' // Explicitly use Cognito User Pool for auth
      });
      
      // Make sure user is defined before proceeding
      if (!user?.userId) {
        setError('Authentication required. Please sign in to view your listings.');
        setIsLoading(false);
        return;
      }
      
      // Fetch listings where sellerId matches the current user and status is 'active'
      const { data } = await client.models.Listing.list({
        filter: {
          sellerId: { eq: user.userId },
          status: { eq: 'active' }
        }
      });
      
      // Ensure we have data before assigning it
      setListings(Array.isArray(data) ? data as Listing[] : []);
      
      // Fetch images for all listings
      if (data && data.length > 0) {
        fetchListingImages(data as Listing[]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load your listings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch image URLs from Amplify Storage
  const fetchListingImages = async (listings: Listing[]) => {
    try {
      // Skip if no listings
      if (!Array.isArray(listings) || listings.length === 0) return;
      
      const { getUrl } = await import('aws-amplify/storage');
      const urls: Record<string, string> = {};
      
      // Process each listing to get its image URL
      await Promise.all(
        listings.map(async (listing) => {
          // Skip if listing is invalid or missing imageKey
          if (!listing?.id || !listing?.imageKey) return;
          
          try {
            const result = await getUrl({
              path: listing.imageKey,
            });
            urls[listing.id] = result.url.toString();
          } catch (error) {
            console.error(`Error fetching image for listing ${listing.id}:`, error);
            // Use a default/placeholder image on error
            urls[listing.id] = '/placeholder-fragrance.jpg';
          }
        })
      );
      
      setImageUrls(urls);
    } catch (error) {
      console.error('Error fetching image URLs:', error);
    }
  };

  const startEditing = (listing: Listing) => {
    setEditingId(listing.id);
    setNewPrice(listing.askingPrice.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewPrice('');
  };

  const updatePrice = async (listingId: string) => {
    if (!listingId) {
      console.error('Invalid listing ID for price update');
      return;
    }
    
    if (!newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) <= 0) {
      return;
    }

    try {
      setIsPriceUpdating(true);
      const client = generateClient<Schema>({
        authMode: 'userPool' // Explicitly use Cognito User Pool for auth
      });
      
      await client.models.Listing.update({
        id: listingId,
        askingPrice: parseFloat(newPrice)
      });
      
      // Update the local state
      setListings(prev => 
        prev.map(listing => 
          listing && listing.id === listingId 
            ? { ...listing, askingPrice: parseFloat(newPrice) } 
            : listing
        )
      );
      
      // Reset editing state
      setEditingId(null);
      setNewPrice('');
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price. Please try again.');
    } finally {
      setIsPriceUpdating(false);
    }
  };

  const confirmTakeDown = (listingId: string) => {
    setDeletingId(listingId);
  };

  const cancelTakeDown = () => {
    setDeletingId(null);
  };

  const takeDownListing = async (listing: Listing) => {
    // Safety check - don't proceed if listing is invalid
    if (!listing || !listing.id) {
      console.error('Invalid listing data for takedown operation');
      alert('Error: Could not process this listing. Please try again later.');
      return;
    }
    
    try {
      const client = generateClient<Schema>({
        authMode: 'userPool' // Explicitly use Cognito User Pool for auth
      });
      
      // Update the listing status to 'removed'
      await client.models.Listing.update({
        id: listing.id,
        status: 'removed'
      });
      
      // Update local state to remove this listing
      setListings(prev => prev.filter(item => item && item.id !== listing.id));
      
      // Reset deletion state
      setDeletingId(null);
    } catch (error) {
      console.error('Error taking down listing:', error);
      alert('Failed to take down listing. Please try again.');
    }
  };

  // Find fragrance details by productId
  const getFragranceDetails = (fragranceId: string) => {
    if (!fragranceId) return { name: 'Unknown Fragrance', brand: 'Unknown Brand' };
    
    return FRAGRANCES.find((f: { productId: string; name: string; brand: string }) => f.productId === fragranceId) || { 
      name: 'Unknown Fragrance', 
      brand: 'Unknown Brand' 
    };
  };

  // Don't render on server to prevent hydration issues
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Current Listings</h1>
            <button
              onClick={() => router.push('/sell/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none"
            >
              Create New Listing
            </button>
          </div>

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
          ) : listings.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active listings</h3>
              <p className="text-gray-500 mb-6">You don't have any active listings yet.</p>
              <button
                onClick={() => router.push('/sell/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none"
              >
                Create New Listing
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {listings.map((listing) => {
                  if (!listing || !listing.fragranceId) return null;
                  
                  const fragrance = getFragranceDetails(listing.fragranceId);
                  return (
                    <li key={listing.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 relative h-16 w-16 rounded-md overflow-hidden">
                          <Image
                            src={imageUrls[listing.id] || '/placeholder-fragrance.jpg'}
                            alt={fragrance.name}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {fragrance.brand} - {fragrance.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {listing.bottleSize} • {listing.condition === 'new' ? 'New' : `Used (${listing.percentRemaining}% remaining)`}
                          </p>
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Active
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 text-right">
                          {editingId === listing.id ? (
                            <div className="flex items-center space-x-1">
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                  <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={newPrice}
                                  onChange={(e) => setNewPrice(e.target.value)}
                                  className="pl-6 pr-2 py-1 w-24 border border-gray-300 rounded-md text-sm"
                                  autoFocus
                                />
                              </div>
                              <button
                                onClick={() => updatePrice(listing.id)}
                                disabled={isPriceUpdating}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Save"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Cancel"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm font-semibold text-gray-900">${parseFloat(listing.askingPrice.toString()).toFixed(2)}</p>
                          )}
                          
                          {/* Action buttons */}
                          {!editingId && !deletingId && (
                            <div className="mt-1 flex space-x-2">
                              <button
                                onClick={() => startEditing(listing)}
                                className="text-xs text-indigo-600 hover:text-indigo-800"
                              >
                                Edit Price
                              </button>
                              <button
                                onClick={() => confirmTakeDown(listing.id)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                          
                          {/* Deletion confirmation */}
                          {deletingId === listing.id && (
                            <div className="mt-1 text-xs">
                              <p className="mb-1 text-gray-700">Remove listing?</p>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => takeDownListing(listing)}
                                  className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={cancelTakeDown}
                                  className="px-2 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
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
    </div>
  );
}