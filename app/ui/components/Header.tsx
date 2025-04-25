"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import ProtectedLink from "./ProtectedLink";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import CartIcon from "./cart/CartIcon";
import BetaInfoPopup from "./info/BetaInfoPopup";

export default function Header() {
  const [isSellMenuOpen, setIsSellMenuOpen] = useState(false);
  const [isBuyerMenuOpen, setIsBuyerMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSellerMenuOpen, setIsMobileSellerMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { authStatus, signOut, user } = useAuthenticator(context => [context.authStatus, context.user]);
  const router = useRouter();

  const sellMenuRef = useRef<HTMLDivElement>(null);
  const buyerMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sellMenuRef.current &&
        !sellMenuRef.current.contains(event.target as Node)
      ) {
        setIsSellMenuOpen(false);
      }
      if (
        buyerMenuRef.current &&
        !buyerMenuRef.current.contains(event.target as Node)
      ) {
        setIsBuyerMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".mobile-menu-toggle")
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch user attributes when authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (authStatus === "authenticated") {
        try {
          const attributes = await fetchUserAttributes();
          const firstName = attributes.given_name || 
                           attributes.name || 
                           user?.username?.split('@')[0] || 
                           'there';
          setUserName(firstName);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserName('there');
        }
      }
      setIsAuthLoading(false);
    };
    
    if (authStatus === "unauthenticated") {
      setIsAuthLoading(false);
    } else {
      fetchUserData();
    }
  }, [authStatus, user]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/');
    }
  };

  // Handler to close mobile menu after navigation
  const handleMobileNavigation = () => {
    setIsMobileMenuOpen(false);
    setIsMobileSellerMenuOpen(false);
  };

  // Render sell menu items
  const renderSellMenuItems = (isMobile: boolean = false) => {
    const linkClass = isMobile 
      ? "block px-4 py-3 text-base text-gray-700 hover:bg-gray-100"
      : "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";
    
    // Don't render anything during auth loading
    if (isAuthLoading) return null;
    
    return authStatus === "authenticated" ? (
      <>
        <Link
          href="/sell/new"
          className={linkClass}
          onClick={isMobile ? handleMobileNavigation : undefined}
        >
          New Listing
        </Link>
        <Link
          href="/sell/current"
          className={linkClass}
          onClick={isMobile ? handleMobileNavigation : undefined}
        >
          Current Listings
        </Link>
        <Link
          href="/sell/sales"
          className={linkClass}
          onClick={isMobile ? handleMobileNavigation : undefined}
        >
          Sales
        </Link>
      </>
    ) : (
      <>
        <ProtectedLink
          href="/sell/new"
          className={linkClass}
          onClick={isMobile ? handleMobileNavigation : undefined}
        >
          New Listing
        </ProtectedLink>
        <ProtectedLink
          href="/sell/current"
          className={linkClass}
          onClick={isMobile ? handleMobileNavigation : undefined}
        >
          Current Listings
        </ProtectedLink>
        <ProtectedLink
          href="/sell/sales"
          className={linkClass}
          onClick={isMobile ? handleMobileNavigation : undefined}
        >
          Sales
        </ProtectedLink>
      </>
    );
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3 md:gap-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 h-[40px] flex items-center">
            <Image
              src="/scentra.svg"
              alt="Scentra Logo"
              width={120}
              height={59}
              priority
              className="hidden md:block h-full w-auto" // Hide on mobile, show on medium and up
            />
            <Image
              src="/scentra-cropped.svg"
              alt="Scentra Logo"
              width={35}
              height={35}
              priority
              className="block md:hidden h-[35px] w-auto" // Show on mobile, hide on medium and up
            />
            <BetaInfoPopup />
          </Link>

          {/* Search Bar */}
          <div className="flex-grow max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search product or brand"
                className="w-full px-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-500 text-gray-800 text-ellipsis"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit" 
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Search"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Sell Button with Dropdown */}
            <div className="relative" ref={sellMenuRef}>
              {!isAuthLoading && (
                <button
                  onClick={() => setIsSellMenuOpen(!isSellMenuOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                >
                  <span>Sell</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}
              {isSellMenuOpen && (
                <div className="absolute -right-2 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {renderSellMenuItems()}
                </div>
              )}
            </div>

            {/* Buyer Menu */}
            <div className="relative -translate-y-[0.2rem]" ref={buyerMenuRef}>
              <button
                onClick={() => setIsBuyerMenuOpen(!isBuyerMenuOpen)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <div className="w-4 h-0.5 bg-gray-700 mb-1"></div>
                  <div className="w-4 h-0.5 bg-gray-700 mb-1"></div>
                  <div className="w-4 h-0.5 bg-gray-700"></div>
                </div>
              </button>
              {isBuyerMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Home
                  </Link>
                  {authStatus === "authenticated" ? (
                    <>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Past Orders
                      </Link>
                      <Link
                        href="/cart"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Cart
                      </Link>
                    </>
                  ) : (
                    <>
                      <ProtectedLink
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Past Orders
                      </ProtectedLink>
                      <Link
                        href="/cart"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Cart
                      </Link>
                    </>
                  )}
                  <Link
                    href="/faq"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    FAQ
                  </Link>
                  <Link
                    href="/about"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    About Us
                  </Link>
                  <div className="border-t border-gray-100 mt-2 pt-2 px-4 py-2 text-sm text-gray-700">
                    Need Help?{" "}
                    <a
                      href="mailto:contact@scentra.app"
                      className="text-blue-600 hover:underline"
                    >
                      contact@scentra.app
                    </a>
                  </div>
                </div>
              )}
            </div>
       
            {/* Cart Icon - Desktop */}
            <CartIcon />
            
            {/* Hello User Message */}
            {authStatus === "authenticated" && (
              <div className="text-sm font-medium text-gray-700">
                {userName ? `Hello ${userName}!` : <div className="h-5 w-16 bg-gray-100 rounded animate-pulse"></div>}
              </div>
            )}

            {/* Authentication Button - Rightmost with black box */}
            {isAuthLoading ? (
              <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : authStatus === "authenticated" ? (
              <button
                onClick={() => {
                  signOut();
                  router.push('/auth');
                }}
                className="text-sm font-medium text-white bg-black flex items-center justify-center px-4 py-2 rounded-md transition duration-200 hover:bg-gray-800 min-w-[110px] whitespace-nowrap h-[40px]"
              >
                <svg
                  className="w-5 h-5 mr-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            ) : (
              <Link
                href="/auth"
                className="text-sm font-medium text-white bg-black flex items-center justify-center px-4 py-2 rounded-md transition duration-200 hover:bg-gray-800 min-w-[110px] whitespace-nowrap h-[40px]"
              >
                <svg
                  className="w-5 h-5 mr-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Log In
              </Link>
            )}
          </div>

          {/* Mobile Right Section */}
          <div className="flex items-center space-x-4 md:hidden">
            {/* Cart Icon - Mobile */}
            <CartIcon />
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-toggle p-1 hover:bg-gray-100 rounded-full"
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <div className="w-5 h-0.5 bg-gray-800 mb-1"></div>
                <div className="w-5 h-0.5 bg-gray-800 mb-1"></div>
                <div className="w-5 h-0.5 bg-gray-800"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden fixed inset-0 top-[65px] bg-white z-50 overflow-y-auto h-[calc(100vh-65px)]"
          >
            <div className="p-4 border-b border-gray-200">
              {isAuthLoading ? (
                <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
              ) : authStatus === "authenticated" ? (
                <div className="flex items-center justify-between mb-2">
                  <div className="text-base font-medium text-gray-800">
                    {userName ? `Hello ${userName}!` : <div className="h-6 w-20 bg-gray-100 rounded animate-pulse"></div>}
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-white bg-black flex items-center justify-center px-3 py-2 rounded-md transition duration-200 hover:bg-gray-800"
                  >
                    <svg
                      className="w-4 h-4 mr-1 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/auth"
                  className="w-full text-base font-medium text-white bg-black flex items-center justify-center px-4 py-3 rounded-md transition duration-200 hover:bg-gray-800 mb-2"
                    onClick={handleMobileNavigation}
                  >
                  <svg
                    className="w-5 h-5 mr-2 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Log In
                  </Link>
                </div>
              )}
            </div>

            {/* Seller Section - Mobile */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => setIsMobileSellerMenuOpen(!isMobileSellerMenuOpen)}
                className="flex items-center justify-between w-full px-4 py-3 text-left text-base font-medium text-gray-800 hover:bg-gray-100"
              >
                <span>Seller Options</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${isMobileSellerMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isMobileSellerMenuOpen && (
                <div className="bg-gray-50">
                  {renderSellMenuItems(true)}
                </div>
              )}
            </div>

            {/* Main Navigation - Mobile */}
            <div>
              <Link
                href="/"
                className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                onClick={handleMobileNavigation}
              >
                Home
              </Link>
              
              {authStatus === "authenticated" ? (
                <>
                  <Link
                    href="/orders"
                    className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                    onClick={handleMobileNavigation}
                  >
                    Past Orders
                  </Link>
                  <Link
                    href="/cart"
                    className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                    onClick={handleMobileNavigation}
                  >
                    My Cart
                  </Link>
                </>
              ) : (
                <>
                  <ProtectedLink
                    href="/orders"
                    className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                    onClick={handleMobileNavigation}
                  >
                    Past Orders
                  </ProtectedLink>
                  <ProtectedLink
                    href="/cart"
                    className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                    onClick={handleMobileNavigation}
                  >
                    My Cart
                  </ProtectedLink>
                </>
              )}
              
              <Link
                href="/faq"
                className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                onClick={handleMobileNavigation}
              >
                FAQ
              </Link>
              <Link
                href="/about"
                className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                onClick={handleMobileNavigation}
              >
                About Us
              </Link>
              
              <div className="px-4 py-4 text-base text-gray-700">
                Need Help?{" "}
                <a
                  href="mailto:contact@scentra.app"
                  className="text-blue-600 hover:underline"
                >
                  contact@scentra.app
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
