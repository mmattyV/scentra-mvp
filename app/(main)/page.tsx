"use client";

import { useState, useEffect, ReactNode, Suspense } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import Image from "next/image";
import Link from "next/link";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import type { Listing, FragranceGroup } from "@/app/types";
import { FRAGRANCES, Fragrance } from '@/app/utils/fragrance-data';
import { useSearchParams, useRouter } from "next/navigation";

// Ensure FRAGRANCES is treated as an array of Fragrance objects
const fragrancesArray: Fragrance[] = Array.isArray(FRAGRANCES) ? FRAGRANCES : [];

// Format price as USD
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

// SearchParamsWrapper component to isolate the useSearchParams hook
function SearchParamsWrapper({ children }: { children: (searchTerm: string) => ReactNode }) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  return <>{children(searchTerm)}</>;
}

// Wrapping the actual HomePage content in a separate client component
function HomePageContent() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [fragranceGroups, setFragranceGroups] = useState<FragranceGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<FragranceGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  
  // State for unconfirmed sales modal
  const [unconfirmedSales, setUnconfirmedSales] = useState<Listing[]>([]);
  const [showUnconfirmedModal, setShowUnconfirmedModal] = useState(false);
  
  const router = useRouter();
  
  // Use SearchParamsWrapper to access search params safely
  return (
    <SearchParamsWrapper>
      {(searchTerm) => {
        // Effect to handle search params and filter groups
        useEffect(() => {
          if (isClient) {
            setCurrentSearchTerm(searchTerm);
            filterFragranceGroups(searchTerm);
          }
        }, [searchTerm, isClient, fragranceGroups]);
        
        // Client-side initialization
        useEffect(() => {
          setIsClient(true);
          fetchListings();
          
          // If user is authenticated, check for unconfirmed sales
          if (user?.userId) {
            checkUnconfirmedSales();
          }
        }, [user]);
        
        // Function to check for unconfirmed sales for sellers
        const checkUnconfirmedSales = async () => {
          if (!user?.userId) return;
          
          try {
            const client = generateClient<Schema>({
              authMode: 'userPool'
            });
            
            // Fetch listings where sellerId matches the current user and status is 'unconfirmed'
            const { data } = await client.models.Listing.list({
              filter: {
                sellerId: { eq: user.userId },
                status: { eq: 'unconfirmed' }
              }
            });
            
            if (data && data.length > 0) {
              setUnconfirmedSales(data as unknown as Listing[]);
              setShowUnconfirmedModal(true);
            }
          } catch (error) {
            console.error('Error checking unconfirmed sales:', error);
          }
        };
        
        // Navigate to sales page
        const goToSalesPage = () => {
          router.push('/sell/sales');
          setShowUnconfirmedModal(false);
        };
        
        // Handle clearing search
        const clearSearch = () => {
          router.push('/');
        };
        
        // Function to fetch active listings
        const fetchListings = async () => {
          try {
            setIsLoading(true);
            const client = generateClient<Schema>();
            
            // Get all active listings
            const { data } = await client.models.Listing.list({
              filter: {
                status: { eq: 'active' }
              }
            });
            
            if (!data || data.length === 0) {
              setFragranceGroups([]);
              setFilteredGroups([]);
              setIsLoading(false);
              return;
            }
            
            // Process listings into fragrance groups
            processListingsIntoGroups(data as Listing[]);
          } catch (error) {
            console.error('Error fetching listings:', error);
            setError('Failed to load fragrances. Please try again later.');
            setIsLoading(false);
          }
        };
        
        // Process listings into fragrance groups
        const processListingsIntoGroups = async (listings: Listing[]) => {
          try {
            const { getUrl } = await import('aws-amplify/storage');
            
            // Group by fragranceId
            const groupedListings: Record<string, Listing[]> = {};
            
            listings.forEach(listing => {
              // Only include listings with a valid fragranceId
              if (listing.fragranceId) {
                if (!groupedListings[listing.fragranceId]) {
                  groupedListings[listing.fragranceId] = [];
                }
                groupedListings[listing.fragranceId].push(listing);
              }
            });
            
            // Create fragrance groups with image URLs
            const groups: FragranceGroup[] = [];
            
            for (const fragranceId in groupedListings) {
              const fragranceListings = groupedListings[fragranceId];
              
              if (fragranceListings.length > 0) {
                // Get fragrance details from our reference data
                const fragranceData = fragrancesArray.find(f => f.productId === fragranceId);
                
                if (fragranceData) {
                  // For buyers: Use the image URL from the CSV fragrance data
                  // This will be displayed on the homepage as the main product image
                  const imageUrl = fragranceData.imageUrl || '/placeholder-fragrance.jpg';
                  
                  // Find lowest price
                  const lowestPrice = Math.min(...fragranceListings.map(listing => listing.askingPrice));
                  
                  groups.push({
                    fragranceId,
                    name: fragranceData.name,
                    brand: fragranceData.brand,
                    lowestPrice,
                    imageUrl,
                    listings: fragranceListings
                  });
                }
              }
            }
            
            // Sort by brand and name
            groups.sort((a, b) => {
              const brandCompare = a.brand.localeCompare(b.brand);
              return brandCompare !== 0 ? brandCompare : a.name.localeCompare(b.name);
            });
            
            setFragranceGroups(groups);
            setFilteredGroups(groups); // Initially, all groups are shown
            setIsLoading(false);
          } catch (error) {
            console.error('Error processing listings:', error);
            setError('Failed to process fragrances. Please try again later.');
            setIsLoading(false);
          }
        };
        
        // Filter fragrance groups based on search term
        const filterFragranceGroups = (searchTerm: string) => {
          if (!searchTerm) {
            setFilteredGroups(fragranceGroups);
            return;
          }
          
          const normalized = searchTerm.toLowerCase();
          const filtered = fragranceGroups.filter(group => {
            return (
              group.name.toLowerCase().includes(normalized) ||
              group.brand.toLowerCase().includes(normalized)
            );
          });
          
          setFilteredGroups(filtered);
        };
        
        return (
          <div className="container mx-auto px-4 py-8">
            {/* Unconfirmed Sales Modal */}
            {showUnconfirmedModal && unconfirmedSales.length > 0 && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="bg-amber-100 p-2 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Action Required</h3>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-gray-700 mb-2">
                      You have <span className="font-bold">{unconfirmedSales.length}</span> unconfirmed {unconfirmedSales.length === 1 ? 'sale' : 'sales'} that {unconfirmedSales.length === 1 ? 'requires' : 'require'} your attention.
                    </p>
                    <p className="text-gray-600 text-sm">
                      Please confirm these sales to proceed with shipping and receive payment.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowUnconfirmedModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Later
                    </button>
                    <button
                      onClick={goToSalesPage}
                      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                    >
                      View Sales
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Hero Section */}
            <div className="mb-8">
              {currentSearchTerm ? (
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">
                    Search results for: <span className="text-gray-600">{currentSearchTerm}</span>
                  </h1>
                  <button 
                    onClick={clearSearch}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center"
                  >
                    <span className="mr-1">Clear</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <h1 className="text-2xl font-bold mb-2">Explore Fragrances</h1>
              )}
              {isLoading ? (
                <div className="min-h-screen bg-white flex items-center justify-center">
                  <div className="text-center">
                    <div className="spinner mb-4"></div>
                    <p className="text-gray-600">Loading fragrances...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredGroups.map((group) => (
                    <Link 
                      href={`/product/${group.fragranceId}`} 
                      key={group.fragranceId}
                      className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={group.imageUrl}
                          alt={`${group.brand} - ${group.name}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain" 
                          priority={false}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm text-gray-500">{group.brand}</h3>
                        <h2 className="font-medium text-gray-900 mb-1">{group.name}</h2>
                        <p className="text-gray-800">From {formatPrice(group.lowestPrice)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }}
    </SearchParamsWrapper>
  );
}

// Main page component with Suspense boundary
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading fragrances...</p>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
