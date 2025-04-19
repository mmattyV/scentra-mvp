'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { v4 as uuidv4 } from 'uuid';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import type { CartItem, Listing } from '@/app/types';
import { FRAGRANCES } from '@/app/utils/fragrance-data';

// Define the Cart Context shape
interface CartContextType {
  items: CartItem[];
  addItem: (listing: Listing, imageUrl: string) => Promise<void>;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  isItemInCart: (listingId: string) => boolean;
  subtotal: number;
  validateCartItems: () => Promise<boolean>;
  isValidating: boolean;
  removeUnavailableItems: () => void;
}

// Create the context with a default empty implementation
const CartContext = createContext<CartContextType>({
  items: [],
  addItem: async () => {},
  removeItem: () => {},
  clearCart: () => {},
  isItemInCart: () => false,
  subtotal: 0,
  validateCartItems: async () => false,
  isValidating: false,
  removeUnavailableItems: () => {},
});

// Provider props type
interface CartProviderProps {
  children: ReactNode;
}

// Local storage key for cart data
const CART_STORAGE_KEY = 'scentra-cart-items';

// Cart Provider Component
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { user } = useAuthenticator((context) => [context.user]);

  // Load cart from local storage on client-side mount
  useEffect(() => {
    setIsClient(true);
    
    // Load saved cart from local storage
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart from local storage:', error);
      }
    };
    
    if (typeof window !== 'undefined') {
      loadCart();
    }
  }, []);

  // Save cart to local storage when it changes
  useEffect(() => {
    if (isClient) {
      if (items.length > 0) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, [items, isClient]);

  // Calculate subtotal whenever items change
  const subtotal = items.reduce((total, item) => {
    return total + (item.isAvailable ? item.currentPrice : 0);
  }, 0);

  // Add item to cart
  const addItem = async (listing: Listing, imageUrl: string) => {
    try {
      // Find fragrance details
      const fragranceData = FRAGRANCES.find(f => f.productId === listing.fragranceId);
      
      if (!fragranceData) {
        console.error('Fragrance data not found for listing:', listing.id);
        return;
      }
      
      // Create new cart item
      const newItem: CartItem = {
        id: uuidv4(),
        listingId: listing.id,
        sellerId: listing.sellerId,
        fragranceId: listing.fragranceId,
        fragranceName: fragranceData.name,
        brand: fragranceData.brand,
        bottleSize: listing.bottleSize,
        condition: listing.condition,
        percentRemaining: listing.percentRemaining,
        originalPrice: listing.askingPrice,
        currentPrice: listing.askingPrice,
        imageUrl: imageUrl,
        addedAt: new Date().toISOString(),
        isAvailable: true,
        priceChanged: false
      };
      
      // Update cart state with new item
      setItems(prev => [...prev, newItem]);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  // Remove item from cart
  const removeItem = (itemId: string) => {
    setItems(prev => {
      const updated = prev.filter(item => item.id !== itemId);
      // If cart is empty after removing, clear local storage
      if (updated.length === 0) {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
      return updated;
    });
  };

  // Clear the entire cart
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  // Check if a listing is already in the cart
  const isItemInCart = (listingId: string) => {
    return items.some(item => item.listingId === listingId);
  };

  // Validate all cart items against current listing data
  const validateCartItems = async () => {
    if (items.length === 0) return false;
    
    try {
      setIsValidating(true);
      const client = generateClient<Schema>();
      let hasChanges = false;
      
      // Create updated cart with availability and price checks
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          try {
            // Fetch current listing data
            const { data: listing } = await client.models.Listing.get({
              id: item.listingId
            });
            
            if (!listing || listing.status !== 'active') {
              hasChanges = true;
              return { ...item, isAvailable: false };
            }
            
            if (listing.askingPrice !== item.originalPrice) {
              hasChanges = true;
              return { 
                ...item, 
                currentPrice: listing.askingPrice, 
                priceChanged: true 
              };
            }
            
            return item;
          } catch (error) {
            console.error(`Error validating cart item ${item.id}:`, error);
            // Handle error by marking item as potentially unavailable
            hasChanges = true;
            return { ...item, isAvailable: false };
          }
        })
      );
      
      setItems(updatedItems);
      return hasChanges;
    } catch (error) {
      console.error('Error validating cart items:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Remove all unavailable items from cart
  const removeUnavailableItems = () => {
    setItems(prev => prev.filter(item => item.isAvailable));
  };

  // Context value
  const contextValue: CartContextType = {
    items,
    addItem,
    removeItem,
    clearCart,
    isItemInCart,
    subtotal,
    validateCartItems,
    isValidating,
    removeUnavailableItems
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Helper function that wraps a component with the CartProvider
export const withCart = <T extends object>(Component: React.ComponentType<T>) => {
  return (props: T) => (
    <CartProvider>
      <Component {...props} />
    </CartProvider>
  );
};
