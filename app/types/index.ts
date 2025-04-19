// Central type definitions for Scentra app

export interface Listing {
  id: string;
  sellerId: string;
  fragranceId: string;
  bottleSize: string;
  condition: string;
  percentRemaining?: number;
  askingPrice: number;
  imageKey: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ListingWithImage extends Listing {
  imageUrl: string;
}

export interface FragranceGroup {
  fragranceId: string;
  name: string;
  brand: string;
  lowestPrice: number;
  imageUrl: string;
  listings: Listing[];
}

export type SaleStatus = 'unconfirmed' | 'shipping_to_scentra' | 'verifying' | 'shipping_to_buyer' | 'completed';

export interface SaleItem extends Omit<Listing, 'sellerId'> {
  status: SaleStatus;
}

export interface UserData {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface FragranceDetails {
  name: string;
  brand: string;
  [key: string]: any;
}

export interface CartItem {
  id: string;
  listingId: string;
  sellerId: string;
  fragranceId: string;
  fragranceName: string;
  brand: string;
  bottleSize: string;
  condition: string;
  percentRemaining?: number;
  originalPrice: number;
  currentPrice: number;
  imageUrl: string;
  addedAt: string;
  isAvailable: boolean;
  priceChanged: boolean;
}

export const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  unconfirmed: 'Unconfirmed',
  shipping_to_scentra: 'Shipping to Scentra',
  verifying: 'Verifying',
  shipping_to_buyer: 'Shipping to Buyer',
  completed: 'Completed',
  removed: 'Removed'
};

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-800',
  unconfirmed: 'bg-yellow-100 text-yellow-800',
  shipping_to_scentra: 'bg-purple-100 text-purple-800',
  verifying: 'bg-orange-100 text-orange-800',
  shipping_to_buyer: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  removed: 'bg-red-100 text-red-800'
};
