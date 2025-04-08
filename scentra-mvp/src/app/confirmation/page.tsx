'use client';

import { useRouter } from 'next/navigation';
import Header from '../components/layout/Header';

export default function ConfirmationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Confirmation Message */}
          <h1 className="text-3xl font-bold text-black mb-8">
            Order Confirmed
          </h1>

          {/* Home Button */}
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Go Home
          </button>
        </div>
      </main>
    </div>
  );
}
