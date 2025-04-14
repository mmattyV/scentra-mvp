"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import ProtectedLink from "./ProtectedLink";
import { useAuthenticator } from "@aws-amplify/ui-react";

export default function Header() {
  const [isSellMenuOpen, setIsSellMenuOpen] = useState(false);
  const [isBuyerMenuOpen, setIsBuyerMenuOpen] = useState(false);
  const [cartCount] = useState(0); // This will be connected to backend later
  const { authStatus } = useAuthenticator(context => [context.authStatus]);

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
            <div className="relative">
              <input
                type="text"
                placeholder="Search product or brand"
                className="w-full px-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-500 text-gray-800 text-ellipsis"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2">
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
            </div>
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

            {/* Cart Button */}
            <div className="relative">
              {authStatus === "authenticated" ? (
                <Link href="/cart" className="hover:text-gray-600">
                  <div className="relative">
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <ProtectedLink href="/cart" className="hover:text-gray-600">
                  <div className="relative">
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </ProtectedLink>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
