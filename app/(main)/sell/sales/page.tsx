'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { FRAGRANCES } from '@/app/utils/fragrance-data';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';

// Define the possible sale statuses
type SaleStatus = 'unconfirmed' | 'shipping_to_scentra' | 'verifying' | 'shipping_to_buyer' | 'completed';

// Interface for a sale item
interface SaleItem {
  id: string;
  fragranceId: string;
  bottleSize: string;
  condition: string;
  percentRemaining?: number;
  askingPrice: number; // Using askingPrice from the Listing model
  imageKey: string;
  status: string; // This will be mapped to SaleStatus for type safety
  createdAt: string;
}

// Status display configuration
const STATUS_LABELS: Record<SaleStatus, string> = {
  unconfirmed: 'Unconfirmed',
  shipping_to_scentra: 'Shipping to Scentra',
  verifying: 'Verifying',
  shipping_to_buyer: 'Shipping to Buyer',
  completed: 'Completed'
};

const STATUS_COLORS: Record<SaleStatus, string> = {
  unconfirmed: 'bg-yellow-100 text-yellow-800',
  shipping_to_scentra: 'bg-purple-100 text-purple-800',
  verifying: 'bg-orange-100 text-orange-800',
  shipping_to_buyer: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800'
};

export default function SalesPage() {
  const router = useRouter();
  const { user } = useAuthenticator((context) => [context.user]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  
  // For confirmation handling
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // For shipping instructions popup
  const [showShippingInstructions, setShowShippingInstructions] = useState(false);
  const [confirmingItem, setConfirmingItem] = useState<SaleItem | null>(null);

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
  
  useEffect(() => {
    if (isClient && isAuthReady && user) {
      fetchSales();
    } else if (isClient && isAuthReady && !user) {
      setIsLoading(false);
      setError('Authentication required. Please sign in to view your sales.');
    }
  }, [isClient, isAuthReady, user]);

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
      setSales(Array.isArray(data) ? data as unknown as SaleItem[] : []);
      
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
      const client = generateClient<Schema>({
        authMode: 'userPool' // Explicitly use Cognito User Pool for auth
      });
      
      await client.models.Listing.update({
        id: confirmingItem.id,
        status: 'shipping_to_scentra'
      });
      
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
    
    return FRAGRANCES.find((f: { productId: string; name: string; brand: string }) => f.productId === fragranceId) || { 
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
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Sales</h1>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={fetchSales} 
              className="mt-4 px-4 py-2 bg-black text-white rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">You don't have any sales yet.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-12">
            {sales.map((item) => {
              if (!item || !item.fragranceId) {
                return null; // Skip rendering this item if it or fragranceId is null/undefined
              }
              const fragrance = getFragranceDetails(item.fragranceId);
              const saleStatus = item.status as SaleStatus;
              
              return (
                <div key={item.id} className="flex items-center gap-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                  {/* Image */}
                  <div className="relative w-24 h-24">
                    <Image
                      src={imageUrls[item.id] || '/placeholder-fragrance.jpg'}
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
                      {item.bottleSize} • {item.condition} 
                      {item.condition === 'used' && item.percentRemaining && 
                        ` • ${item.percentRemaining}% remaining`
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Product ID: {item.fragranceId}</p>
                  </div>

                  {/* Price */}
                  <div className="text-lg font-medium text-gray-700">
                    ${item.askingPrice?.toFixed(2)}
                  </div>

                  {/* Status */}
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[saleStatus] || 'bg-gray-100 text-gray-800'}`}>
                      {STATUS_LABELS[saleStatus] || item.status}
                    </span>

                    {/* Unconfirmed Sale Actions */}
                    {item.status === 'unconfirmed' && (
                      <div className="flex flex-col items-end space-y-2">
                        {showConfirmation !== item.id ? (
                          <button
                            onClick={() => handleConfirmClick(item)}
                            className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                          >
                            Confirm Sale
                          </button>
                        ) : (
                          <div className="mt-2 space-y-2">
                            <p className="text-sm text-gray-700">Are you sure?</p>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleConfirm}
                                disabled={isConfirming}
                                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setShowConfirmation(null)}
                                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Shipping Instructions Modal */}
        {showShippingInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Shipping Instructions</h3>
              <p className="mb-4">
                Please package your fragrance securely and ship it to Scentra for verification at the following address:
              </p>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="font-medium">Scentra Verification Center</p>
                <p>123 Verification Way</p>
                <p>San Francisco, CA 94103</p>
                <p className="mt-2">Order ID: #{confirmingItem?.id.substring(0, 8)}</p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Please include the Order ID on your shipping label. Once we receive and verify the product, we'll update the status and ship it to the buyer.
              </p>
              <button
                onClick={closeShippingInstructions}
                className="w-full px-4 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800"
              >
                I Understand
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}