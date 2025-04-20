'use client';

import { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { fetchUsersByIds } from '@/app/utils/admin-api-client';
import { FRAGRANCES } from '@/app/utils/fragrance-data';
import type { Listing, UserData } from '@/app/types';

import AdminTable from './components/AdminTable';
import StatusFilter from './components/StatusFilter';
import StatusChangeModal from './components/StatusChangeModal';
import ListingDetailsModal from './components/ListingDetailsModal';

// Define the valid status options based on current status
const getValidStatusTransitions = (currentStatus: string): string[] => {
  // Define which statuses a listing can be changed to based on current status
  switch(currentStatus) {
    case 'active':
      return ['removed', 'on_hold', 'unconfirmed'];
    case 'on_hold':
      return ['active', 'unconfirmed', 'removed'];
    case 'unconfirmed':
      return ['shipping_to_scentra', 'removed'];
    case 'shipping_to_scentra':
      return ['verifying', 'removed'];
    case 'verifying':
      return ['shipping_to_buyer', 'removed'];
    case 'shipping_to_buyer':
      return ['completed', 'removed'];
    case 'completed':
      return ['removed'];
    case 'removed':
      return []; // Cannot change status once removed
    default:
      return ['removed'];
  }
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
                lastName: attributes.family_name || '',
                phone: attributes.phone_number || ''
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
      // Set empty object to avoid null/undefined issues
      setSellerInfo({});
    }
  };

  // Function to change listing status
  const changeListingStatus = async (listingId: string, newStatus: string) => {
    try {
      // Initialize Amplify client
      const client = generateClient({
        authMode: 'userPool' // Explicitly use Cognito User Pool for auth
      });
      await (client as any).models.Listing.update({
        id: listingId,
        status: newStatus
      });
      
      // Update local state
      setListings(prevListings => 
        prevListings.map(listing => 
          listing.id === listingId ? { ...listing, status: newStatus } : listing
        )
      );
      
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error('Error updating listing status:', error);
      alert('Failed to update listing status. Please try again.');
    }
  };

  // Find fragrance details by productId
  const getFragranceDetails = (fragranceId: string) => {
    return FRAGRANCES.find((f: any) => f.productId === fragranceId) || { 
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
        <h1 className="text-3xl font-bold text-black mb-8">Admin Dashboard - Listings</h1>
        
        <StatusFilter 
          currentFilter={statusFilter} 
          onFilterChange={setStatusFilter} 
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => setStatusFilter(statusFilter)} // Re-fetch by "changing" to same filter
              className="mt-4 px-4 py-2 bg-black text-white rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No listings found.</p>
          </div>
        ) : (
          <AdminTable 
            listings={listings}
            sellerInfo={sellerInfo}
            getFragranceDetails={getFragranceDetails}
            onStatusChange={(listing: Listing) => {
              setSelectedListing(listing);
              setIsStatusModalOpen(true);
            }}
            onViewDetails={(listing: Listing) => {
              setSelectedListing(listing);
              setIsDetailsModalOpen(true);
            }}
          />
        )}
        
        {isStatusModalOpen && selectedListing && (
          <StatusChangeModal
            listing={selectedListing}
            validStatusOptions={getValidStatusTransitions(selectedListing.status)}
            onClose={() => setIsStatusModalOpen(false)}
            onStatusChange={changeListingStatus}
          />
        )}
        
        {isDetailsModalOpen && selectedListing && (
          <ListingDetailsModal
            listing={selectedListing}
            sellerInfo={selectedListing.sellerId in sellerInfo ? sellerInfo[selectedListing.sellerId] : undefined}
            fragranceDetails={getFragranceDetails(selectedListing.fragranceId)}
            onClose={() => setIsDetailsModalOpen(false)}
          />
        )}
      </main>
    </div>
  );
}
