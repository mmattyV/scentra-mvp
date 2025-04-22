'use client';

import { useState, useRef, useEffect } from 'react';

export default function BetaInfoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Reference for the button
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Skip if clicking the button - we'll handle that separately
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return;
      }
      
      // Close if clicking outside the popup
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Function to toggle popup
  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={buttonRef}
        onClick={togglePopup}
        className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Beta information"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          className="w-5 h-5"
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </button>
      
      {isOpen && (
        <div 
          ref={popupRef}
          className="absolute top-full left-0 md:left-auto mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl z-50 p-5 text-sm text-gray-700"
          style={{ maxHeight: '80vh', overflowY: 'auto' }}
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Welcome to the Beta Version of Scentra</h3>
            
            <p>
              At Scentra, our mission is to create a trustworthy and seamless marketplace for fragrance enthusiasts. 
              In this beta version, we are proud to introduce our verification system, where sellers send their fragrances 
              to us for authentication. Once verified, we ship the genuine product to the buyer, ensuring a safe and 
              reliable transaction for both parties.
            </p>
            
            <p>
              We're committed to continuously improving the platform based on your feedback and are excited to make 
              Scentra the ultimate destination for fragrance lovers.
            </p>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Upcoming Features:</h4>
              <ul className="space-y-3 list-disc pl-5">
                <li>
                  <span className="font-bold">Bid System:</span> Buyers will soon be able to create wishlists and place bids 
                  on desired fragrances. Sellers will be notified of demand, making it easier to match buyers with the 
                  scents they seek.
                </li>
                <li>
                  <span className="font-bold">Government ID Verification:</span> To enhance security, we plan to implement 
                  government ID checks to prevent scammers and bots from exploiting our community. Trust and safety 
                  remain our top priorities.
                </li>
                <li>
                  <span className="font-bold">Community Hub:</span> We're building a space for users to showcase their 
                  collections, share reviews, and engage in discussions about their favorite fragrances.
                </li>
              </ul>
            </div>
            
            <p className="italic border-t pt-3 text-gray-600">
              Thank you for being part of our journey. Your feedback is essential in helping us grow—together, 
              we can build the best fragrance marketplace out there.
            </p>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="mt-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors w-full"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
