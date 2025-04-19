'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import type { Listing, ListingWithImage } from '@/app/types';
import { FRAGRANCES } from '@/app/utils/fragrance-data';
import { useCart } from '@/app/context/CartContext';

export default function ProductDetailsPage() {
  const router = useRouter();
  const { fragranceId } = useParams();
  const [listings, setListings] = useState<ListingWithImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Cart Context
  const { addItem, isItemInCart } = useCart();
  
  // Modals
  const [isReturnPolicyOpen, setReturnPolicyOpen] = useState(false);
  const [isVerificationOpen, setVerificationOpen] = useState(false);
  
  // Get fragrance details from the static data
  const fragranceDetails = FRAGRANCES.find(f => f.productId === fragranceId);
  
  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Fetch listings when component mounts and fragranceId changes
  useEffect(() => {
    if (isClient && fragranceId) {
      fetchListings();
    }
  }, [isClient, fragranceId]);
  
  const fetchListings = async () => {
    if (!fragranceId) return;
    
    try {
      setIsLoading(true);
      
      // Generate the client for accessing Amplify Data
      const client = generateClient<Schema>();
      
      // Fetch all active listings for this fragrance
      const { data } = await client.models.Listing.list({
        filter: {
          fragranceId: { eq: fragranceId as string },
          status: { eq: 'active' }
        }
      });
      
      // Handle empty or invalid response
      if (!Array.isArray(data) || data.length === 0) {
        setListings([]);
        setIsLoading(false);
        return;
      }
      
      const listingsData = data as Listing[];
      
      // Fetch image URLs for all listings
      const listingsWithImages = await fetchListingImages(listingsData);
      setListings(listingsWithImages);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load listings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch image URLs from Amplify Storage
  const fetchListingImages = async (listings: Listing[]): Promise<ListingWithImage[]> => {
    try {
      if (!Array.isArray(listings) || listings.length === 0) return [];
      
      const { getUrl } = await import('aws-amplify/storage');
      const listingsWithImages: ListingWithImage[] = [];
      
      await Promise.all(
        listings.map(async (listing) => {
          if (!listing?.id || !listing?.imageKey) {
            // Add listing without image
            listingsWithImages.push({
              ...listing,
              imageUrl: '/placeholder-fragrance.jpg'
            });
            return;
          }
          
          try {
            const result = await getUrl({
              path: listing.imageKey,
            });
            listingsWithImages.push({
              ...listing,
              imageUrl: result.url.toString()
            });
          } catch (error) {
            console.error(`Error fetching image for listing ${listing.id}:`, error);
            // Use a default/placeholder image on error
            listingsWithImages.push({
              ...listing,
              imageUrl: '/placeholder-fragrance.jpg'
            });
          }
        })
      );
      
      // Sort by price (lowest first)
      return listingsWithImages.sort((a, b) => a.askingPrice - b.askingPrice);
    } catch (error) {
      console.error('Error fetching image URLs:', error);
      return [];
    }
  };
  
  // Check if selected listing is in cart
  const isSelectedItemInCart = () => {
    if (!selectedListingId) return false;
    return isItemInCart(selectedListingId);
  };
  
  // Add selected listing to cart
  const handleAddToCart = async () => {
    if (!selectedListingId) {
      return;
    }
    
    // Find the selected listing
    const selectedListing = listings.find(listing => listing.id === selectedListingId);
    if (!selectedListing) {
      return;
    }
    
    setAddingToCart(true);
    
    try {
      await addItem(selectedListing, selectedListing.imageUrl);
      setAddedToCart(true);
      
      // Reset the added to cart state after 3 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };
  
  const toggleListingSelection = (listingId: string) => {
    setSelectedListingId(prev => prev === listingId ? null : listingId);
  };
  
  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  // Early return for loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Early return for errors
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchListings();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Early return if fragrance not found
  if (!fragranceDetails) {
    return (
      <div className="min-h-screen bg-white">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Fragrance Not Found</h2>
            <p className="text-gray-600 mb-4">We couldn't find the fragrance you're looking for.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column - Image */}
          <div className="relative aspect-square">
            {listings.length > 0 ? (
              <Image
                src={listings[0].imageUrl}
                alt={fragranceDetails.name}
                fill
                className="object-cover rounded-lg"
                priority
              />
            ) : (
              <Image
                src="/placeholder-fragrance.jpg"
                alt={fragranceDetails.name}
                fill
                className="object-cover rounded-lg"
                priority
              />
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="relative flex flex-col h-full">
            <div>
              <div className="space-y-3 mb-6">
                <h2 className="text-xl font-medium text-gray-700 tracking-wide">{fragranceDetails.brand}</h2>
                <h1 className="text-4xl font-semibold text-black tracking-tight">{fragranceDetails.name}</h1>
                
                {listings.length > 0 ? (
                  <p className="text-2xl font-semibold text-black mt-6">
                    Starting at {formatPrice(listings[0].askingPrice)}
                  </p>
                ) : (
                  <p className="text-2xl font-medium text-gray-500 mt-6">
                    Currently unavailable
                  </p>
                )}
              </div>

              <div className="space-y-6">
                {/* Available Listings */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Available Options</h3>
                  
                  {listings.length === 0 ? (
                    <div className="border rounded-lg p-4 text-center text-gray-500">
                      No listings available at the moment.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
                      {listings.map((listing) => (
                        <button
                          key={listing.id}
                          className={`border rounded-lg p-4 text-left transition-all ${
                            selectedListingId === listing.id 
                              ? 'border-black bg-gray-50 shadow-sm' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleListingSelection(listing.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatPrice(listing.askingPrice)}
                              </p>
                              <div className="text-sm text-gray-600 mt-1">
                                <p>Size: {listing.bottleSize}</p>
                                <p>Condition: {listing.condition}</p>
                                {listing.condition === 'used' && listing.percentRemaining !== undefined && listing.percentRemaining <= 100 && (
                                  <p>{listing.percentRemaining}% remaining</p>
                                )}
                                {listing.condition === 'used' && listing.percentRemaining === 100 && (
                                  <p>Open box</p>
                                )}
                              </div>
                            </div>
                            {selectedListingId === listing.id && (
                              <div className="h-6 w-6 rounded-full bg-black text-white flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Add to Cart Button */}
                {listings.length > 0 && (
                  <button
                    onClick={() => {
                      if (isSelectedItemInCart()) {
                        // Navigate to cart if item is already in cart
                        router.push('/cart');
                      } else {
                        // Add to cart
                        handleAddToCart();
                      }
                    }}
                    disabled={!selectedListingId || addingToCart}
                    className={`w-full py-4 text-white rounded-lg font-medium transition-colors ${
                      !selectedListingId
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : isSelectedItemInCart()
                          ? 'bg-green-600 hover:bg-green-700'
                          : addedToCart
                            ? 'bg-green-600'
                            : 'bg-black hover:bg-gray-800'
                    }`}
                  >
                    {!selectedListingId 
                      ? 'Select an Option Above'
                      : addingToCart
                        ? 'Adding to Cart...'
                        : isSelectedItemInCart()
                          ? 'View in Cart'
                          : addedToCart
                            ? 'Added to Cart!'
                            : 'Add to Cart'
                    }
                  </button>
                )}

                {/* Info Links */}
                <div className="pt-6 border-t space-y-4 mt-auto">
                  <div>
                    <button
                      onClick={() => setReturnPolicyOpen(true)}
                      className="font-medium text-gray-500 hover:text-gray-800 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Return Policy
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => setVerificationOpen(true)}
                      className="font-medium text-gray-500 hover:text-gray-800 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Verification Information
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Return Policy Modal */}
      {isReturnPolicyOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
            <h3 className="text-2xl font-semibold mb-6 text-black">Return Policy</h3>
            <p className="text-gray-700 leading-relaxed">
              At Scentra, all sales are final once the authentication and verification process is complete. If you receive a product that doesn't match the verified condition, please contact our customer service team within 48 hours of delivery.
            </p>
            <button
              onClick={() => setReturnPolicyOpen(false)}
              className="w-full mt-6 p-4 text-white bg-black rounded-lg hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {isVerificationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
            <h3 className="text-2xl font-semibold mb-6 text-black">Verification Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Every fragrance sold on Scentra goes through our rigorous authentication process:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700 mb-4">
              <li>Sellers ship their fragrances to our verification center</li>
              <li>Our expert team inspects each product for authenticity</li>
              <li>We verify the condition and percentage remaining</li>
              <li>Only after successful verification do we ship to the buyer</li>
            </ol>
            <p className="text-gray-700 leading-relaxed">
              This process ensures you receive exactly what you paid for, every time.
            </p>
            <button
              onClick={() => setVerificationOpen(false)}
              className="w-full mt-6 p-4 text-white bg-black rounded-lg hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
