"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import ProtectedLink from "./ProtectedLink";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import CartIcon from "./cart/CartIcon";

export default function Header() {
  const [isSellMenuOpen, setIsSellMenuOpen] = useState(false);
  const [isBuyerMenuOpen, setIsBuyerMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { authStatus, signOut, user } = useAuthenticator(context => [context.authStatus, context.user]);
  const router = useRouter();

  const sellMenuRef = useRef<HTMLDivElement>(null);
  const buyerMenuRef = useRef<HTMLDivElement>(null);

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
    };
    
    fetchUserData();
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

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-8">
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

          {/* Right Section */}
          <div className="flex items-center space-x-8">
            {/* Sell Button with Dropdown */}
            <div className="relative" ref={sellMenuRef}>
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
              {isSellMenuOpen && (
                <div className="absolute -right-2 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {authStatus === "authenticated" ? (
                    <>
                      <Link
                        href="/sell/new"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        New Listing
                      </Link>
                      <Link
                        href="/sell/current"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Current Listings
                      </Link>
                      <Link
                        href="/sell/sales"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sales
                      </Link>
                    </>
                  ) : (
                    <>
                      <ProtectedLink
                        href="/sell/new"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        New Listing
                      </ProtectedLink>
                      <ProtectedLink
                        href="/sell/current"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Current Listings
                      </ProtectedLink>
                      <ProtectedLink
                        href="/sell/sales"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sales
                      </ProtectedLink>
                    </>
                  )}
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
                      <ProtectedLink
                        href="/cart"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Cart
                      </ProtectedLink>
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
                    Contact Us:{" "}
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
       
            {/* Cart Icon */}
            <CartIcon />
            {/* Hello User Message */}
            {authStatus === "authenticated" && (
              <div className="text-sm font-medium text-gray-700">
                Hello {userName}!
              </div>
            )}

            {/* Authentication Button - Rightmost with black box */}
            {authStatus === "authenticated" ? (
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
        </div>
      </nav>
    </header>
  );
}
