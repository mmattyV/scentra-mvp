'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { FRAGRANCES } from '@/app/utils/fragrance-data';
import { fetchAuthSession } from 'aws-amplify/auth';

interface Listing {
  id: string;
  fragranceId: string;
  bottleSize: string;
  condition: string;
  percentRemaining?: number;
  askingPrice: number;
  imageKey: string;
  status: string;
  createdAt: string;
}

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
        <h1 className="text-3xl font-bold text-black mb-8">Current Listings</h1>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={fetchListings} 
              className="mt-4 px-4 py-2 bg-black text-white rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">You don't have any active listings.</p>
            <button 
              onClick={() => router.push('/sell/new')} 
              className="mt-4 px-4 py-2 bg-black text-white rounded-md"
            >
              Create New Listing
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-12">
            {listings.map((listing) => {
              if (!listing || !listing.fragranceId) {
                return null; // Skip rendering this item if listing or fragranceId is null/undefined
              }
              const fragrance = getFragranceDetails(listing.fragranceId);
              return (
                <div key={listing.id} className="flex items-center gap-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                  {/* Image */}
                  <div className="relative w-24 h-24">
                    <Image
                      src={imageUrls[listing.id] || '/placeholder-fragrance.jpg'}
                      alt={fragrance.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium text-black">{fragrance.name}</h3>
                    <p className="text-sm text-gray-600">{fragrance.brand}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {listing.bottleSize} • {listing.condition} 
                      {listing.condition === 'used' && listing.percentRemaining && 
                        ` • ${listing.percentRemaining}% remaining`
                      }
                    </p>
                  </div>

                  {/* Ask Price */}
                  <div className="text-lg font-medium text-gray-700">
                    {editingId === listing.id ? (
                      <div className="flex items-center space-x-2">
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
                          />
                        </div>
                        <button
                          onClick={() => updatePrice(listing.id)}
                          disabled={isPriceUpdating}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      `$${listing.askingPrice.toFixed(2)}`
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4">
                    {deletingId === listing.id ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-red-600">Confirm?</span>
                        <button
                          onClick={() => takeDownListing(listing)}
                          className="px-2 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                        >
                          Yes
                        </button>
                        <button
                          onClick={cancelTakeDown}
                          className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(listing)}
                          disabled={editingId !== null}
                          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
                        >
                          Change Ask
                        </button>
                        <button
                          onClick={() => confirmTakeDown(listing.id)}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                        >
                          Take Down
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}