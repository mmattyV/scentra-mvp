'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function VerificationProcessDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const drawerRef = useRef<HTMLDivElement>(null);
  const trapezoidRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  
  // Only show on home page
  const isHomePage = pathname === '/' || pathname === '/page';

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Don't close if clicking the trapezoid
      if (trapezoidRef.current && trapezoidRef.current.contains(event.target as Node)) {
        return;
      }
      
      // Close if clicking outside the drawer and it's open
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle scroll to show/hide tab ONLY when drawer is closed
  useEffect(() => {
    // Only add scroll listener if drawer is closed
    if (isOpen) {
      setIsVisible(true); // Always ensure visibility when drawer is open
      return;
    }
    
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        const scrollThreshold = 50; // Lower threshold for quicker response
        
        // Show tab when scrolling up
        if (currentScrollY < lastScrollY.current) {
          setIsVisible(true);
        } 
        // Hide tab when scrolling down and past threshold
        else if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
          setIsVisible(false);
        }
        
        lastScrollY.current = currentScrollY;
      }
    };
    
    window.addEventListener('scroll', controlNavbar);
    
    // Cleanup function
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [isOpen]);

  // Toggle drawer state
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  // Don't render anything if not on home page
  if (!isHomePage) return null;
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ${isVisible ? 'translate-y-0' : 'translate-y-[150%]'}`}>
      <div className="relative">
        {/* Trapezoid */}
        <div 
          ref={trapezoidRef}
          onClick={toggleDrawer}
          className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full z-10"
        >
          <div 
            className="text-white py-2 px-6 cursor-pointer flex items-center justify-center space-x-2 w-72"
            style={{ 
              clipPath: 'polygon(3% 0%, 97% 0%, 100% 100%, 0% 100%)',
              backgroundColor: '#000000',
              boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            >
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <span className="font-medium">Verification Process</span>
          </div>
        </div>
        
        {/* Drawer Content */}
        <div 
          ref={drawerRef}
          className={`bg-white border-t border-gray-200 shadow-lg transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ 
            height: isOpen ? '80vh' : '0',
            overflow: isOpen ? 'auto' : 'hidden',
            maxHeight: '80vh'
          }}
        >
          <div className="container mx-auto px-4 py-8 h-full overflow-y-auto">
            <h2 className="text-2xl font-bold text-center mb-8 text-black">Our Verification Process</h2>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-gray-700 mb-10">
                At Scentra, we ensure every fragrance is authentic through our rigorous verification process.
                Here's how we bring trust and transparency to fragrance resale:
              </p>
              
              {/* Verification Process Diagram */}
              <div className="relative flex flex-col md:flex-row items-center justify-between mb-10">
                {/* Step 1: Seller Ships */}
                <div className="flex flex-col items-center text-center mb-8 md:mb-0 md:w-1/3">
                  <div className="bg-gray-100 rounded-full p-6 mb-4 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="8" x2="8" y2="8"></line>
                      <line x1="16" y1="12" x2="8" y2="12"></line>
                      <line x1="16" y1="16" x2="8" y2="16"></line>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">1. Seller Ships</h3>
                  <p className="text-gray-700 text-sm">
                    The seller packages and ships their fragrance directly to our verification center.
                  </p>
                </div>
                
                {/* Arrow 1 */}
                <div className="hidden md:block w-12 h-1 bg-gray-400"></div>
                
                {/* Step 2: Verification */}
                <div className="flex flex-col items-center text-center mb-8 md:mb-0 md:w-1/3">
                  <div className="bg-gray-100 rounded-full p-6 mb-4 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">2. We Verify</h3>
                  <p className="text-gray-700 text-sm">
                    Our experts authenticate the fragrance, checking for quality, condition, and authenticity.
                  </p>
                </div>
                
                {/* Arrow 2 */}
                <div className="hidden md:block w-12 h-1 bg-gray-400"></div>
                
                {/* Step 3: Buyer Receives */}
                <div className="flex flex-col items-center text-center md:w-1/3">
                  <div className="bg-gray-100 rounded-full p-6 mb-4 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">3. Buyer Receives</h3>
                  <p className="text-gray-700 text-sm">
                    Once verified, we ship the authentic fragrance directly to the buyer.
                  </p>
                </div>
              </div>
              
              {/* Mobile Process Arrows */}
              <div className="md:hidden flex flex-col items-center my-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </div>
              
              {/* Trust Badge */}
              <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 rounded-lg p-6 text-center mt-8 mb-4 shadow-md border border-gray-200">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">The Scentra Trust Guarantee</h3>
                <p className="text-gray-700">
                  Every transaction is protected by our verification process. We don't release payment to the seller until our team verifies the product. This creates a safe marketplace for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
