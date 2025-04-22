import { useState, useEffect } from 'react';
import type { Listing, UserData, FragranceDetails } from '@/app/types';
import Image from 'next/image';
import { STATUS_LABELS, STATUS_COLORS } from '@/app/types';

interface AdminTableProps {
  listings: Listing[];
  sellerInfo: Record<string, UserData>;
  getFragranceDetails: (fragranceId: string) => FragranceDetails;
  onStatusChange: (listing: Listing) => void;
  onViewDetails: (listing: Listing) => void;
}

export default function AdminTable({
  listings,
  sellerInfo,
  getFragranceDetails,
  onStatusChange,
  onViewDetails
}: AdminTableProps) {
  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(listings.length / itemsPerPage);
  
  // For image URLs
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  
  // Calculate items for current page
  const paginatedListings = listings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Fetch image URLs from Storage - using the approach from CurrentListingsPage
  useEffect(() => {
    const fetchListingImages = async () => {
      try {
        if (!Array.isArray(listings) || listings.length === 0) return;
        
        setIsLoadingImages(true);
        const { getUrl } = await import('aws-amplify/storage');
        const urls: Record<string, string> = {};
        
        // Process each listing to get its image URL
        await Promise.all(
          listings
            .filter(listing => listing && listing.imageKey && typeof listing.imageKey === 'string' && listing.imageKey.trim() !== '')
            .map(async (listing) => {
              try {
                // Use the regular path parameter without options
                // The S3 permission will be handled by the backend
                const result = await getUrl({
                  path: listing.imageKey
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
      } finally {
        setIsLoadingImages(false);
      }
    };
    
    fetchListingImages();
  }, [listings]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Helper function to display seller name
  const getSellerDisplayName = (seller: UserData): string => {
    if (seller.firstName && seller.lastName) {
      return `${seller.firstName} ${seller.lastName}`;
    } else if (seller.firstName) {
      return seller.firstName;
    } else if (seller.username) {
      return seller.username;
    } else {
      return 'Unknown Seller';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Seller
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedListings.map((listing) => {
            // Add null check before accessing fragranceId
            if (!listing || !listing.fragranceId) {
              return null; // Skip rendering items without valid data
            }
            
            const fragrance = getFragranceDetails(listing.fragranceId);
            const seller = sellerInfo[listing.sellerId] || { username: 'Unknown', email: 'Unknown' };
            
            return (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 relative rounded-md overflow-hidden">
                      {isLoadingImages ? (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                      ) : (
                        <div className="relative h-10 w-10">
                          <Image 
                            src={imageUrls[listing.id] || '/placeholder-fragrance.jpg'} 
                            alt={fragrance?.name || 'Fragrance'}
                            width={40}
                            height={40}
                            className="object-cover"
                            style={{ width: '100%', height: '100%' }} 
                            onError={(e) => {
                              // Cast the event target to HTMLImageElement to access src
                              const target = e.target as HTMLImageElement;
                              console.error(`Image load error for ${target.src}`);
                              
                              // Just use the placeholder image and don't try to refresh the URL
                              // This prevents the infinite loop of 403 errors
                              target.src = '/placeholder-fragrance.jpg';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{fragrance.name}</div>
                      <div className="text-sm text-gray-500">{fragrance.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{getSellerDisplayName(seller)}</div>
                  <div className="text-sm text-gray-500">{seller.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{listing.bottleSize} • {listing.condition}</div>
                  {listing.condition === 'used' && listing.percentRemaining && (
                    <div className="text-sm text-gray-500">{listing.percentRemaining}% remaining</div>
                  )}
                  <div className="text-sm text-gray-500">{listing.hasOriginalBox ? 'With original box' : 'No original box'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${listing.askingPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[listing.status] || 'bg-gray-100 text-gray-800'}`}>
                    {STATUS_LABELS[listing.status] || listing.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(listing.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onViewDetails(listing)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Details
                  </button>
                  {listing.status !== 'removed' && (
                    <button
                      onClick={() => onStatusChange(listing)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Change Status
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 px-6 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, listings.length)}
            </span>{' '}
            of <span className="font-medium">{listings.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
