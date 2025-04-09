'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAmplifyConfig } from '@/app/lib/amplify';
import { signOut } from 'aws-amplify/auth';
import { User } from '@/app/types';
import { Search, ShoppingCart, User as UserIcon, Menu, X } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';

export default function Header() {
  const { authState, signOut: contextSignOut } = useAuth();
  const { user, isAuthenticated, loading } = authState;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Initialize Amplify on client side
    getAmplifyConfig();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await contextSignOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900">Scentra</span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search fragrances..."
                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search 
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
                aria-hidden="true" 
              />
            </form>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/cart" className="p-1 rounded-full hover:bg-gray-100">
              <ShoppingCart className="h-6 w-6" aria-hidden="true" />
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1 rounded-full hover:bg-gray-100 flex items-center"
                >
                  <UserIcon className="h-6 w-6" aria-hidden="true" />
                  <span className="ml-1">{user?.name?.split(' ')[0]}</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    {user?.role === 'buyer' || user?.role === 'admin' ? (
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        My Orders
                      </Link>
                    ) : null}

                    {user?.role === 'seller' || user?.role === 'admin' ? (
                      <>
                        <Link
                          href="/sell"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Seller Dashboard
                        </Link>
                        <Link
                          href="/sell/create"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Create Listing
                        </Link>
                      </>
                    ) : null}

                    {user?.role === 'admin' ? (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                    ) : null}

                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <form onSubmit={handleSearch} className="px-4">
              <input
                type="text"
                placeholder="Search fragrances..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search 
                className="absolute left-7 top-[4.5rem] h-5 w-5 text-gray-400" 
                aria-hidden="true" 
              />
            </form>

            {isAuthenticated ? (
              <>
                {user?.role === 'buyer' || user?.role === 'admin' ? (
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    My Orders
                  </Link>
                ) : null}

                {user?.role === 'seller' || user?.role === 'admin' ? (
                  <>
                    <Link
                      href="/sell"
                      className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Seller Dashboard
                    </Link>
                    <Link
                      href="/sell/create"
                      className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Create Listing
                    </Link>
                  </>
                ) : null}

                {user?.role === 'admin' ? (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Admin Dashboard
                  </Link>
                ) : null}

                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="px-4 py-2">
                <Link
                  href="/login"
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
