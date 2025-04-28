// Central type definitions for Scentra app

export interface Listing {
  id: string;
  sellerId: string;
  fragranceId: string;
  bottleSize: string;
  condition: string;
  percentRemaining?: number;
  hasOriginalBox: boolean;
  batchCode?: string;
  askingPrice: number;
  imageKey: string;
  status: string;
  createdAt: string;
  updatedAt: string;
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
  condition: string;
}

export type SaleStatus = 'on_hold' | 'unconfirmed' | 'shipping_to_scentra' | 'verifying' | 'shipping_to_buyer' | 'completed';

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
  sellerId?: string;
  fragranceId: string;
  fragranceName: string;
  brand: string;
  bottleSize: string;
  condition: string;
  percentRemaining?: number;
  hasOriginalBox: boolean;
  batchCode?: string;
  originalPrice: number;
  currentPrice: number;
  imageUrl: string;
  sellerImageUrl?: string;
  addedAt: string;
  isAvailable: boolean;
  priceChanged: boolean;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  listingId: string;
  sellerId: string;
  fragranceId: string;
  fragranceName: string;
  brand: string;
  bottleSize: string;
  condition: string;
  percentRemaining?: number;
  hasOriginalBox: boolean;
  batchCode?: string;
  price: number;
  imageUrl: string;
  imageKey: string;
  status: SaleStatus;
}

export interface Order {
  id: string;
  buyerId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  total: number;
  paymentStatus: 'awaiting_payment' | 'paid' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'venmo' | 'paypal';
  paymentInstructions: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// Original status types for listings (keeping these as they were)
export const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  on_hold: 'On Hold',
  unconfirmed: 'Unconfirmed',
  shipping_to_scentra: 'Shipping to Scentra',
  verifying: 'Verifying',
  shipping_to_buyer: 'Shipping to Buyer',
  completed: 'Completed',
  removed: 'Removed'
};

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-800',
  on_hold: 'bg-amber-100 text-amber-800',
  unconfirmed: 'bg-yellow-100 text-yellow-800',
  shipping_to_scentra: 'bg-purple-100 text-purple-800',
  verifying: 'bg-orange-100 text-orange-800',
  shipping_to_buyer: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  removed: 'bg-red-100 text-red-800'
};

// New order-specific status colors and labels
export const ORDER_STATUS_COLORS: Record<string, string> = {
  // Order statuses
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  
  // Payment statuses
  awaiting_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-red-100 text-red-800',

  // Listing statuses within orders
  active: 'bg-blue-100 text-blue-800',
  on_hold: 'bg-amber-100 text-amber-800',
  unconfirmed: 'bg-yellow-100 text-yellow-800',
  shipping_to_scentra: 'bg-purple-100 text-purple-800',
  verifying: 'bg-orange-100 text-orange-800',
  shipping_to_buyer: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  removed: 'bg-red-100 text-red-800'
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  // Order statuses
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  
  // Payment statuses
  awaiting_payment: 'Awaiting Payment',
  paid: 'Paid',
  refunded: 'Refunded',

  // Listing statuses within orders
  active: 'Active',
  on_hold: 'On Hold',
  unconfirmed: 'Unconfirmed',
  shipping_to_scentra: 'Shipping to Scentra',
  verifying: 'Verifying',
  shipping_to_buyer: 'Shipping to Buyer',
  completed: 'Completed',
  removed: 'Removed'
};
