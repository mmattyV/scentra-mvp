"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import Image from "next/image";
import Link from "next/link";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import type { Listing, FragranceGroup } from "@/app/types";
import { FRAGRANCES } from '@/app/utils/fragrance-data';
import { useSearchParams, useRouter } from "next/navigation";

// SearchParamsWrapper component to isolate the useSearchParams hook
function SearchParamsWrapper({ children }: { children: (searchTerm: string) => React.ReactNode }) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  return <>{children(searchTerm)}</>;
}

export default function HomePage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [fragranceGroups, setFragranceGroups] = useState<FragranceGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<FragranceGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient) {
      fetchListings();
    }
  }, [isClient]);
  
  // Apply filtering when search term changes
  useEffect(() => {
    if (fragranceGroups.length > 0) {
      filterFragrances(currentSearchTerm);
    }
  }, [currentSearchTerm, fragranceGroups]);

  // Update the search term state when the URL changes
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search') || '';
    setCurrentSearchTerm(urlSearchTerm);
  }, [searchParams]);

  // Filter fragrances based on search term
  const filterFragrances = (searchTerm: string) => {
    if (!searchTerm) {
      setFilteredGroups(fragranceGroups);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = fragranceGroups.filter(group => 
      group.name.toLowerCase().includes(term) || 
      group.brand.toLowerCase().includes(term)
    );
    
    setFilteredGroups(filtered);
  };
  
  // Clear search filters
  const clearSearch = () => {
    router.push('/');
  };
  
  const fetchListings = async () => {
    try {
      setIsLoading(true);
      // Generate the client for accessing Amplify Data
      const client = generateClient<Schema>();
      
      // Fetch all active listings
      const { data } = await client.models.Listing.list({
        filter: {
          status: { eq: 'active' }
        }
      });
      
      // Handle empty or invalid response
      if (!Array.isArray(data) || data.length === 0) {
        setFragranceGroups([]);
        setFilteredGroups([]);
        setIsLoading(false);
        return;
      }
      
      const listings = data as Listing[];
      
      // Fetch image URLs for all listings
      const imageUrls = await fetchListingImages(listings);
      
      // Group listings by fragranceId
      const grouped = groupListingsByFragrance(listings, imageUrls);
      setFragranceGroups(grouped);
      setFilteredGroups(grouped);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load fragrances. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch image URLs from Amplify Storage
  const fetchListingImages = async (listings: Listing[]): Promise<Record<string, string>> => {
    try {
      if (!Array.isArray(listings) || listings.length === 0) return {};
      
      const { getUrl } = await import('aws-amplify/storage');
      const urls: Record<string, string> = {};
      
      await Promise.all(
        listings.map(async (listing) => {
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
      
      return urls;
    } catch (error) {
      console.error('Error fetching image URLs:', error);
      return {};
    }
  };
  
  // Group listings by fragranceId to display unique fragrances
  const groupListingsByFragrance = (listings: Listing[], imageUrls: Record<string, string>): FragranceGroup[] => {
    const fragranceMap = new Map<string, FragranceGroup>();
    
    listings.forEach(listing => {
      // Skip invalid listings
      if (!listing.fragranceId) return;
      
      const fragranceData = FRAGRANCES.find(f => f.productId === listing.fragranceId);
      if (!fragranceData) return; // Skip if fragrance data not found
      
      // Get the image URL for this listing
      const imageUrl = imageUrls[listing.id] || '/placeholder-fragrance.jpg';
      
      if (fragranceMap.has(listing.fragranceId)) {
        // Update existing group
        const group = fragranceMap.get(listing.fragranceId)!;
        
        // Update lowest price if this listing has a lower price
        if (listing.askingPrice < group.lowestPrice) {
          group.lowestPrice = listing.askingPrice;
          // Update image if we're using the lowest price listing's image
          group.imageUrl = imageUrl;
        }
        
        // Add listing to the group
        group.listings.push(listing);
      } else {
        // Create new group
        fragranceMap.set(listing.fragranceId, {
          fragranceId: listing.fragranceId,
          name: fragranceData.name,
          brand: fragranceData.brand,
          lowestPrice: listing.askingPrice,
          imageUrl: imageUrl,
          listings: [listing]
        });
      }
    });
    
    // Convert map to array and sort by name
    return Array.from(fragranceMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading fragrances...</p>
        </div>
      </div>
    }>
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
    </Suspense>
  );
}
