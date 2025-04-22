'use client';

import Image from 'next/image';
import Link from 'next/link';
import BetaInfoPopup from '../ui/BetaInfoPopup';

export default function PreLoginHeader() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/scentra.svg"
                alt="Scentra Logo"
                width={120}
                height={59}
                priority
              />
            </Link>
            <div className="ml-6">
              <BetaInfoPopup />
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-grow max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search product or brand"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
