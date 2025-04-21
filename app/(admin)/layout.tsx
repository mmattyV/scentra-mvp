'use client';

import Link from 'next/link';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import "@aws-amplify/ui-react/styles.css";
import Image from "next/image";
import AuthWrapper from '../ui/components/AuthWrapper';
import { fetchAuthSession } from 'aws-amplify/auth';
import AdminNav from './admin/components/AdminNav';

// Amplify is now configured at the root level in AuthenticatorProvider

// Simple header component with just logo and auth button
function AdminHeader() {
  const { authStatus, user, signOut } = useAuthenticator((context) => [
    context.authStatus,
    context.user,
    context.signOut,
  ]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 h-[40px] flex items-center">
              <Image
                src="/scentra.svg"
                alt="Scentra Logo"
                width={120}
                height={59}
                priority
                className="h-full w-auto"
              />
            </Link>
            <span className="ml-4 text-gray-500 text-sm">Admin Dashboard</span>
          </div>
          
          <div className="flex items-center space-x-8">
            {authStatus === "authenticated" && (
              <div className="text-sm font-medium text-gray-700">
                Hello {user?.signInDetails?.loginId?.split('@')[0] || 'Admin'}!
              </div>
            )}
            
            {authStatus === "authenticated" ? (
              <button
                onClick={signOut}
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
                href="/admin"
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
      </div>
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authStatus } = useAuthenticator((context) => [context.user, context.authStatus]);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if user is in the ADMINS group using JWT tokens
  useEffect(() => {
    const checkAdminGroupMembership = async () => {
      if (!isClient || authStatus !== 'authenticated') {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch the current auth session to get the ID token
        const session = await fetchAuthSession({ forceRefresh: true });
        
        // Get the groups from the token claims
        // Cognito stores group information in 'cognito:groups' claim
        const groups = session.tokens?.idToken?.payload['cognito:groups'] || [];
        
        if (Array.isArray(groups) && groups.includes('ADMINS')) {
          console.log('User is in ADMINS group, granting access');
          setIsAdmin(true);
        } else {
          console.log('User is not in ADMINS group, denying access');
          setIsAdmin(false);
          
          // Don't redirect if we're in local development - makes debugging easier
          if (process.env.NODE_ENV !== 'development') {
            router.push('/');
          } else {
            console.warn('In development mode: Not redirecting non-admin user');
          }
        }
      } catch (error) {
        console.error('Error checking admin group membership:', error);
        setIsAdmin(false);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminGroupMembership();
  }, [isClient, router, authStatus]);

  // Don't render on server to prevent hydration issues
  if (!isClient) {
    return null;
  }

  // If not authenticated, show authentication UI
  if (authStatus !== 'authenticated') {
    return (
      <>
        <AdminHeader />
        <main className="flex-grow">
          <AuthWrapper>
            <div className="text-center py-8">
              <p className="text-lg mb-4">Please sign in to access the admin dashboard.</p>
            </div>
          </AuthWrapper>
        </main>
      </>
    );
  }

  // If loading, show loading indicator
  if (isLoading) {
    return (
      <>
        <AdminHeader />
        <main className="container mx-auto px-4 py-16 flex-grow">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent"></div>
          </div>
        </main>
      </>
    );
  }

  // If authenticated but not admin, show unauthorized message
  if (!isAdmin) {
    return (
      <>
        <AdminHeader />
        <main className="container mx-auto px-4 py-16 flex-grow">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-700 mb-6">
              You do not have permission to access this page.
              This area is restricted to admin users only.
            </p>
            <Link 
              href="/"
              className="inline-block px-4 py-2 bg-black text-white rounded-md"
            >
              Return to Homepage
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      
      {/* Admin Navigation */}
      {isAdmin && <AdminNav />}
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
    </>
  );
}
