export interface Fragrance {
  fragranceId: string; // Partition Key
  name: string;
  brand: string;
  description: string;
  imageUrl: string;
}

export interface User {
  userId: string; // Partition Key
  email: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin';
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Listing {
  listingId: string; // Partition Key
  sellerId: string;
  fragranceId: string;
  size: number; // in ml
  condition: 'new' | 'used';
  percentRemaining: number;
  askingPrice: number;
  status: 'available' | 'unconfirmed' | 'sold';
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  fragranceId: string;
  userId: string;
  price: number;
  status: 'active' | 'accepted' | 'expired';
  expiresAt: Date;
}

export interface Order {
  orderId: string; // Partition Key
  buyerId: string;
  sellerId: string;
  listingId: string;
  status: 'waitingApproval' | 'shippingToScentra' | 'verifying' | 'shippingToBuyer' | 'delivered';
  shippingAddress: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  listingId: string;
  quantity: number;
  selectedForCheckout: boolean;
}

export interface Cart {
  cartId: string; // Partition Key
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

// Additional types for UI components

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface PaymentMethod {
  type: 'venmo' | 'paypal';
  handle: string;
}

export interface CheckoutFormData {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: 'venmo' | 'paypal';
}
