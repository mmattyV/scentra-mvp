'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { v4 as uuidv4 } from 'uuid';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import type { CartItem, Listing, ShippingAddress, SaleStatus } from '@/app/types';
import { FRAGRANCES } from '@/app/utils/fragrance-data';
import { updateListingWithStatusSync } from '@/app/utils/listingStatusSync';

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
  createOrder: (shippingAddress: ShippingAddress, paymentMethod: 'venmo' | 'paypal') => Promise<string>;
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
  createOrder: async () => '',
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

  // Create an order from cart items
  const createOrder = async (shippingAddress: ShippingAddress, paymentMethod: 'venmo' | 'paypal'): Promise<string> => {
    if (!user) {
      throw new Error('User must be logged in to create an order');
    }
    
    if (items.length === 0) {
      throw new Error('Cart is empty');
    }
    
    try {
      // Generate Amplify client with user authentication
      const client = generateClient<Schema>({
        authMode: 'userPool'
      });
      
      // Create a unique order ID
      const orderId = uuidv4();
      
      // Calculate verification fee (3% of subtotal)
      const verificationFee = subtotal * 0.03;
      
      // Calculate total including verification fee
      const total = subtotal + verificationFee;
      
      // Convert cart items to order items
      const orderItems = items.map(item => ({
        id: uuidv4(),
        orderId,
        listingId: item.listingId,
        sellerId: item.sellerId,
        fragranceId: item.fragranceId,
        fragranceName: item.fragranceName,
        brand: item.brand,
        bottleSize: item.bottleSize,
        condition: item.condition,
        percentRemaining: item.percentRemaining,
        price: item.currentPrice,
        imageUrl: item.imageUrl,
        status: 'unconfirmed' as SaleStatus
      }));
      
      // Create payment instructions based on payment method
      const paymentInstructions = paymentMethod === 'venmo' 
        ? 'Please send payment to @Scentra with your Order ID in the memo.'
        : 'Please send payment to payment@scentra.com with your Order ID in the memo.';
      
      // Create the serialized version of the shipping address for storage
      const serializedShippingAddress = JSON.stringify(shippingAddress);
      
      try {
        // Step 1: Re-validate all listings to ensure they're still active
        const listingValidations = await Promise.all(
          items.map(async (item) => {
            try {
              const { data: listing } = await client.models.Listing.get({
                id: item.listingId
              });
              
              if (!listing || listing.status !== 'active') {
                return { id: item.listingId, isValid: false };
              }
              
              return { id: item.listingId, isValid: true };
            } catch (error) {
              console.error(`Error validating listing ${item.listingId}:`, error);
              return { id: item.listingId, isValid: false };
            }
          })
        );
        
        // Check if all listings are valid
        const invalidListings = listingValidations.filter(item => !item.isValid);
        if (invalidListings.length > 0) {
          throw new Error('Some items are no longer available for purchase');
        }

        // Step 2: Create order in Amplify DataStore
        await client.models.Order.create({
          id: orderId,
          buyerId: user.username,
          shippingAddress: serializedShippingAddress,
          subtotal,
          total,
          paymentStatus: 'awaiting_payment',
          orderStatus: 'pending',
          paymentMethod,
          paymentInstructions,
          notes: `Includes 3% verification fee: $${verificationFee.toFixed(2)}`,
          createdAt: new Date().toISOString()
        });
        
        // Step 3: Create order items
        for (const item of orderItems) {
          try {
            await client.models.OrderItem.create({
              id: item.id,
              orderId: item.orderId,
              listingId: item.listingId,
              sellerId: item.sellerId,
              fragranceId: item.fragranceId,
              fragranceName: item.fragranceName,
              brand: item.brand,
              bottleSize: item.bottleSize,
              condition: item.condition,
              percentRemaining: item.percentRemaining,
              price: item.price,
              imageUrl: item.imageUrl,
              status: item.status
            });
          } catch (error) {
            console.error(`Error creating order item for ${item.id}:`, error);
            // Continue with other items even if one fails
          }
        }
        
        // Step 4: Only after order and items are created, update listing statuses to on_hold
        // Use optimistic concurrency control with a two-step process
        const statusUpdateResults = await Promise.all(
          items.map(async (item) => {
            try {
              // First, get the current listing to check its status
              const { data: currentListing } = await client.models.Listing.get({
                id: item.listingId
              });
              
              // Only update if the listing is still active
              if (!currentListing || currentListing.status !== 'active') {
                return { id: item.listingId, success: false, message: 'Item is no longer available' };
              }
              
              // If it's active, update it to on_hold
              try {
                await updateListingWithStatusSync(item.listingId, 'on_hold', 'userPool');
              } catch (error) {
                return { id: item.listingId, success: false, message: error instanceof Error ? error.message : 'Unknown error' };
              }
              
              return { id: item.listingId, success: true };
            } catch (error) {
              console.error(`Error updating listing status for ${item.listingId}:`, error);
              return { id: item.listingId, success: false, message: error instanceof Error ? error.message : 'Unknown error' };
            }
          })
        );
        
        // Check if any status updates failed due to concurrency issues
        const failedUpdates = statusUpdateResults.filter(result => !result.success);
        if (failedUpdates.length > 0) {
          // Some items were purchased by someone else between our validation and update
          // We need to roll back and clean up the order we just created
          
          try {
            // Delete the created order
            await client.models.Order.delete({
              id: orderId
            });
            
            // Delete all created order items
            for (const item of orderItems) {
              try {
                await client.models.OrderItem.delete({
                  id: item.id
                });
              } catch (deleteError) {
                console.error(`Error deleting order item ${item.id} during rollback:`, deleteError);
              }
            }
            
            // Get names of items that were no longer available
            const unavailableItems = await Promise.all(
              failedUpdates.map(async (failed) => {
                try {
                  // Get the name of the failed item for a better error message
                  const failedItem = items.find(item => item.listingId === failed.id);
                  return failedItem ? failedItem.fragranceName : 'Unknown item';
                } catch (error) {
                  return 'Unknown item';
                }
              })
            );
            
            // Throw a detailed error for the user
            throw new Error(`Some items were purchased by another user while you were checking out: ${unavailableItems.join(', ')}`);
          } catch (rollbackError) {
            console.error('Error during checkout rollback:', rollbackError);
            throw new Error('Another user purchased one or more items in your cart. Your order was not completed.');
          }
        }
        
        // Step 5: Clear the cart after successful order creation
        clearCart();
        
        // Return the order ID for redirect to confirmation page
        return orderId;
      } catch (error) {
        console.error('Error creating order:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order. Please try again.');
    }
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
    removeUnavailableItems,
    createOrder
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
