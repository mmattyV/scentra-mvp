'use client';

import { useState, useEffect } from 'react';

interface Listing {
  id: string;
  sellerId: string;
  fragranceId: string;
  bottleSize: string;
  condition: string;
  percentRemaining?: number;
  askingPrice: number;
  status: string;
  imageKey: string;
  createdAt: string;
  updatedAt?: string;
}

interface User {
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  [key: string]: any;
}

interface FragranceDetails {
  name: string;
  brand: string;
  [key: string]: any;
}

interface ListingDetailsModalProps {
  listing: Listing;
  sellerInfo: User | undefined;
  fragranceDetails: FragranceDetails;
  onClose: () => void;
}

// Status display configuration
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-800',
  unconfirmed: 'bg-yellow-100 text-yellow-800',
  shipping_to_scentra: 'bg-purple-100 text-purple-800',
  verifying: 'bg-orange-100 text-orange-800',
  shipping_to_buyer: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  removed: 'bg-red-100 text-red-800'
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  unconfirmed: 'Unconfirmed',
  shipping_to_scentra: 'Shipping to Scentra',
  verifying: 'Verifying',
  shipping_to_buyer: 'Shipping to Buyer',
  completed: 'Completed',
  removed: 'Removed'
};

export default function ListingDetailsModal({
  listing,
  sellerInfo,
  fragranceDetails,
  onClose
}: ListingDetailsModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get image URL from S3
  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        setIsLoading(true);
        
        if (!listing.imageKey) {
          setImageUrl('/placeholder-fragrance.jpg');
          return;
        }
        
        const { getUrl } = await import('aws-amplify/storage');
        const result = await getUrl({
          path: listing.imageKey
        });
        
        setImageUrl(result.url.toString());
      } catch (error) {
        console.error('Error fetching image URL:', error);
        setImageUrl('/placeholder-fragrance.jpg');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchImageUrl();
  }, [listing.imageKey]);
  
  // Format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium">Listing Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: Image and product details */}
            <div>
              <div className="mb-4 aspect-square relative bg-gray-100 rounded-md overflow-hidden">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent"></div>
                  </div>
                ) : imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={fragranceDetails.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Product Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">Name:</span>{' '}
                    <span className="font-medium">{fragranceDetails.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Brand:</span>{' '}
                    <span>{fragranceDetails.brand}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Product ID:</span>{' '}
                    <span className="font-mono text-sm">{listing.fragranceId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Bottle Size:</span>{' '}
                    <span>{listing.bottleSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Condition:</span>{' '}
                    <span>{listing.condition}</span>
                  </div>
                  {listing.condition === 'used' && listing.percentRemaining && (
                    <div>
                      <span className="text-gray-500">Remaining:</span>{' '}
                      <span>{listing.percentRemaining}%</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Price:</span>{' '}
                    <span className="font-medium">${listing.askingPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column: Seller, status, and listing details */}
            <div>
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Listing Details</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">Listing ID:</span>{' '}
                    <span className="font-mono text-sm">{listing.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>{' '}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[listing.status] || 'bg-gray-100 text-gray-800'}`}>
                      {STATUS_LABELS[listing.status] || listing.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>{' '}
                    <span>{formatDate(listing.createdAt)}</span>
                  </div>
                  {listing.updatedAt && (
                    <div>
                      <span className="text-gray-500">Last Updated:</span>{' '}
                      <span>{formatDate(listing.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Seller Information</h4>
                {sellerInfo ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-500">Username:</span>{' '}
                      <span>{sellerInfo.username}</span>
                    </div>
                    {sellerInfo.firstName && sellerInfo.lastName && (
                      <div>
                        <span className="text-gray-500">Name:</span>{' '}
                        <span>{sellerInfo.firstName} {sellerInfo.lastName}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Email:</span>{' '}
                      <span>{sellerInfo.email}</span>
                    </div>
                    {sellerInfo.phone && (
                      <div>
                        <span className="text-gray-500">Phone:</span>{' '}
                        <span>{sellerInfo.phone}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Seller ID:</span>{' '}
                      <span className="font-mono text-sm">{sellerInfo.userId}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Seller information not available</p>
                )}
              </div>
              
              {/* Buyer Information (would be fetched in a real implementation) */}
              {['unconfirmed', 'shipping_to_scentra', 'verifying', 'shipping_to_buyer', 'completed'].includes(listing.status) && (
                <div>
                  <h4 className="text-lg font-medium mb-2">Buyer Information</h4>
                  <p className="text-sm text-gray-500 italic">
                    In the full implementation, buyer details would be shown here for sold items.
                    This would be fetched from order records linked to this listing.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
