"use client";

import { useState, useEffect, ReactNode, Suspense } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import Image from "next/image";
import Link from "next/link";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import type { Listing, FragranceGroup } from "@/app/types";
import { FRAGRANCES } from '@/app/utils/fragrance-data';
import { useSearchParams, useRouter } from "next/navigation";

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
        }, []);
        
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
                const fragranceData = FRAGRANCES.find(f => f.productId === fragranceId);
                
                if (fragranceData) {
                  // Use the first listing's image as the representative image
                  let imageUrl = '/placeholder-fragrance.jpg'; // Default placeholder
                  
                  try {
                    if (fragranceListings[0].imageKey) {
                      const result = await getUrl({
                        path: fragranceListings[0].imageKey,
                      });
                      imageUrl = result.url.toString();
                    }
                  } catch (error) {
                    console.error(`Error fetching image for listing ${fragranceListings[0].id}:`, error);
                  }
                  
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
                      className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={group.imageUrl}
                          alt={group.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={false}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-500">{group.brand}</p>
                        <p className="mt-2 text-lg font-medium text-gray-900">
                          From ${group.lowestPrice}
                        </p>
                        <p className="text-sm text-gray-500">
                          {group.listings.length} listing{group.listings.length !== 1 ? 's' : ''}
                        </p>
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
