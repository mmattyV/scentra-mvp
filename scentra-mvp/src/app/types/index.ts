export interface Fragrance {
  id: string;
  name: string;
  brand: string;
  description: string;
  imageUrl: string;
  price: number;
  size: string;
  concentration: string; // EDT, EDP, etc.
  year: number;
  lowestAsk?: number;
  highestBid?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  collection: string[]; // Array of fragrance IDs
}

export interface Listing {
  id: string;
  fragranceId: string;
  sellerId: string;
  price: number;
  condition: string;
  status: 'active' | 'sold' | 'cancelled';
  createdAt: Date;
}

export interface Bid {
  id: string;
  fragranceId: string;
  userId: string;
  price: number;
  status: 'active' | 'accepted' | 'expired';
  expiresAt: Date;
}
