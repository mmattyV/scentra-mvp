'use client';

import { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { fetchUsersByIds } from '@/app/utils/admin-api-client';
import { FRAGRANCES, Fragrance } from '@/app/utils/fragrance-data';
import type { Listing, UserData } from '@/app/types';
import { updateListingWithStatusSync } from '@/app/utils/listingStatusSync';
import type { Schema } from '@/amplify/data/resource';

import AdminTable from '../components/AdminTable';
import ListingFilterBar from '../components/ListingFilterBar';
import StatusChangeModal from '../components/StatusChangeModal';
import ListingDetailsModal from '../components/ListingDetailsModal';

// Ensure FRAGRANCES is treated as an array of Fragrance objects
const fragrancesArray: Fragrance[] = Array.isArray(FRAGRANCES) ? FRAGRANCES : [];

// Define the valid status options based on current status
const getValidStatusTransitions = (currentStatus: string): string[] => {
  // Return all possible statuses regardless of current status
  // This allows changing from any status to any other status
  const allStatuses = [
    'active',
    'on_hold',
    'unconfirmed',
    'shipping_to_scentra',
    'verifying',
    'shipping_to_buyer',
    'completed',
    'removed'
  ];
  
  // Filter out the current status to prevent changing to the same status
  return allStatuses.filter(status => status !== currentStatus);
};

export default function AdminDashboard() {
  const { user, authStatus } = useAuthenticator((context) => [context.user, context.authStatus]);
  const [isClient, setIsClient] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [sellerInfo, setSellerInfo] = useState<Record<string, UserData>>({});
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For order and buyer information when viewing listing details
  const [orderInfo, setOrderInfo] = useState<any | null>(null);
  const [buyerInfo, setBuyerInfo] = useState<UserData | null>(null);
  const [isLoadingOrderInfo, setIsLoadingOrderInfo] = useState(false);

  // Set client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Admin check is now handled by the admin layout, no need for additional checks here
  // The admin layout will prevent non-admin users from accessing this page
  
  // Fetch listings data
  useEffect(() => {
    const fetchListings = async () => {
      if (!isClient || authStatus !== 'authenticated') {
        return;
      }
      
      try {
        setIsLoading(true);
        // Initialize Amplify client without type constraints
        const client = generateClient({
          authMode: 'userPool' // Explicitly use Cognito User Pool for auth
        });
        
        let filter = {};
        
        // Apply status filter if not 'all'
        if (statusFilter !== 'all') {
          filter = {
            status: { eq: statusFilter }
          };
        }
        
        console.log('Fetching listings with filter:', filter);
        
        try {
          // Using any type here because the Amplify v2 type system is hard to work with
          const response = await (client as any).models.Listing.list({
            filter,
            sort: { field: 'createdAt', direction: 'desc' },
          });
          
          console.log('Listings data:', response.data);
          
          if (Array.isArray(response.data) && response.data.length > 0) {
            setListings(response.data as Listing[]);
            
            // Collect unique seller IDs to fetch their info
            // Explicitly create a string array to satisfy TypeScript
            const sellerIds: string[] = [];
            
            // Safely extract seller IDs
            response.data.forEach((item: any) => {
              if (item && typeof item.sellerId === 'string') {
                if (!sellerIds.includes(item.sellerId)) {
                  sellerIds.push(item.sellerId);
                }
              }
            });
            
            // Fetch seller information for all listings
            if (sellerIds.length > 0) {
              await fetchSellerInfo(sellerIds);
            }
          } else {
            setListings([]);
            setSellerInfo({});
          }
        } catch (err) {
          console.error('Error with Amplify client:', err);
          setError('Error fetching listings');
          setListings([]);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Failed to load listings');
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListings();
  }, [isClient, statusFilter, authStatus]);

  // Fetch seller information
  const fetchSellerInfo = async (sellerIds: string[]) => {
    try {
      if (sellerIds.length === 0) {
        setSellerInfo({});
        return;
      }
      
      console.log('Fetching seller information for IDs:', sellerIds);
      
      // User is an admin, attempt to use the admin API to get user data
      try {
        // Use our admin API client to fetch user data for all seller IDs
        const usersData = await fetchUsersByIds(sellerIds);
        
        // Set the seller info with the fetched data
        if (Object.keys(usersData).length > 0) {
          setSellerInfo(usersData);
          return;
        }
      } catch (adminApiError) {
        console.error('Error using admin API:', adminApiError);
        // Continue to fallback mechanism
      }
      
      // Fallback to the existing mechanism if admin API fails
      const realUsers: Record<string, UserData> = {};
      
      // Process each seller ID
      await Promise.all(
        sellerIds.map(async (sellerId) => {
          try {
            // For the authenticated user, we can get their attributes
            if (user && user.userId === sellerId) {
              const attributes = await fetchUserAttributes();
              realUsers[sellerId] = {
                userId: sellerId,
                username: attributes.preferred_username || attributes.name || user.username || 'User',
                email: attributes.email || 'email@example.com',
                firstName: attributes.given_name || '',
                lastName: attributes.family_name || ''
              };
              return; // Successfully found user data, exit early
            }
            
            // If we reach here, use fallback data
            const shortId = sellerId.substring(0, 6).toUpperCase();
            realUsers[sellerId] = {
              userId: sellerId,
              username: `Seller ${shortId}`,
              email: `seller-${shortId.toLowerCase()}@example.com`,
              firstName: 'Seller',
              lastName: `#${shortId}`
            };
          } catch (error) {
            console.error(`Error with seller data for ${sellerId}:`, error);
            // Fallback data if all else fails
            const shortId = sellerId.substring(0, 6).toUpperCase();
            realUsers[sellerId] = {
              userId: sellerId,
              username: 'Unknown',
              email: 'unknown@example.com',
              firstName: 'Unknown',
              lastName: 'Seller'
            };
          }
        })
      );
      
      setSellerInfo(realUsers);
    } catch (error) {
      console.error('Error fetching seller info:', error);
      setSellerInfo({});
    }
  };

  // Update listing status
  const changeListingStatus = async (listingId: string, newStatus: string) => {
    try {
      // Validate if status is valid
      const listing = listings.find(l => l.id === listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      // Check if transition is valid
      const validTransitions = getValidStatusTransitions(listing.status);
      if (!validTransitions.includes(newStatus)) {
        throw new Error(`Cannot change from ${listing.status} to ${newStatus}`);
      }
      
      // Use the utility function to update the listing status
      await updateListingWithStatusSync(listingId, newStatus, 'userPool');
      
      // Update local state to reflect changes
      setListings(prevListings => 
        prevListings.map(l => 
          l.id === listingId ? { ...l, status: newStatus } : l
        )
      );
      
      // Close the modal
      setIsStatusModalOpen(false);
      setSelectedListing(null);
    } catch (error) {
      console.error('Error changing status:', error);
      alert(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle opening listing details, with order and buyer info for purchased listings
  const handleViewListingDetails = async (listing: Listing) => {
    setSelectedListing(listing);
    
    // Reset previous order and buyer info
    setOrderInfo(null);
    setBuyerInfo(null);
    
    // Only fetch order info for listings that have been purchased
    if (['unconfirmed', 'shipping_to_scentra', 'verifying', 'shipping_to_buyer', 'completed'].includes(listing.status)) {
      try {
        setIsLoadingOrderInfo(true);
        
        // Create Amplify client
        const client = generateClient<Schema>({
          authMode: 'userPool'
        });
        
        // Find order items that contain this listing
        const { data: orderItems } = await client.models.OrderItem.list({
          filter: {
            listingId: { eq: listing.id }
          }
        });
        
        if (orderItems && orderItems.length > 0) {
          // Get the order ID from the first order item
          const orderId = orderItems[0].orderId;
          
          // Fetch the order details
          const { data: order } = await client.models.Order.get({
            id: orderId
          });
          
          if (order) {
            setOrderInfo(order);
            
            // Fetch buyer information
            if (order && typeof order === 'object' && 'buyerId' in order) {
              try {
                const buyersData = await fetchUsersByIds([order.buyerId as string]);
                if (buyersData && buyersData[order.buyerId as string]) {
                  setBuyerInfo(buyersData[order.buyerId as string]);
                }
              } catch (error) {
                console.error('Error fetching buyer info:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching order information:', error);
      } finally {
        setIsLoadingOrderInfo(false);
      }
    }
    
    setIsDetailsModalOpen(true);
  };

  // Don't render on server
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Listings Management</h1>
        
        {/* Status Filter */}
        <ListingFilterBar 
          statusFilter={statusFilter} 
          onStatusFilterChange={setStatusFilter} 
        />
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent"></div>
          </div>
        ) : (
          listings.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">No listings found for the selected filter.</p>
            </div>
          ) : (
            <AdminTable 
              listings={listings}
              sellerInfo={sellerInfo}
              getFragranceDetails={(fragranceId: string) => {
                return fragrancesArray.find(f => f.productId === fragranceId) || {
                  productId: fragranceId,
                  name: 'Unknown',
                  brand: 'Unknown'
                };
              }}
              onStatusChange={(listing: Listing) => {
                setSelectedListing(listing);
                setIsStatusModalOpen(true);
              }}
              onViewDetails={(listing: Listing) => {
                handleViewListingDetails(listing);
              }}
            />
          )
        )}
        
        {/* Status Change Modal */}
        {isStatusModalOpen && selectedListing && (
          <StatusChangeModal
            listing={selectedListing}
            validStatusOptions={getValidStatusTransitions(selectedListing.status)}
            onClose={() => {
              setIsStatusModalOpen(false);
              setSelectedListing(null);
            }}
            onStatusChange={changeListingStatus}
          />
        )}
        
        {/* Details Modal */}
        {isDetailsModalOpen && selectedListing && (
          <ListingDetailsModal
            listing={selectedListing}
            sellerInfo={sellerInfo[selectedListing.sellerId]}
            fragranceDetails={fragrancesArray.find(f => f.productId === (selectedListing as any).fragranceId) || {
              productId: (selectedListing as any).fragranceId || 'Unknown',
              name: (selectedListing as any).fragranceName || 'Unknown',
              brand: (selectedListing as any).brand || 'Unknown',
              imageUrl: '' // Empty imageUrl to ensure the seller's uploaded image is used
            }}
            buyerInfo={buyerInfo}
            orderId={orderInfo?.id}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedListing(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
