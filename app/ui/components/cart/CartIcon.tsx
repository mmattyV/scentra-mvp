'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';

interface CartIconProps {
  className?: string;
}

export const CartIcon = ({ className = '' }: CartIconProps) => {
  const { items } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [animateCount, setAnimateCount] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Track item count changes for animation
  useEffect(() => {
    if (!isClient) return;
    
    // Check if count actually increased
    if (items.length > itemCount) {
      setAnimateCount(true);
      
      // Reset animation after it completes
      const timeout = setTimeout(() => {
        setAnimateCount(false);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
    
    setItemCount(items.length);
  }, [items.length, isClient, itemCount]);

  // Don't render anything during SSR
  if (!isClient) return null;

  return (
    <Link 
      href="/cart"
      aria-label="View cart"
      className={`relative inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="w-6 h-6"
      >
        <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
      </svg>

      {items.length > 0 && (
        <span 
          className={`absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-black rounded-full ${
            animateCount ? 'animate-pulse' : ''
          }`}
        >
          {items.length}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
