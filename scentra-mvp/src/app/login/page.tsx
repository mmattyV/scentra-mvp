'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4">
      {/* Logo */}
      <div className="mb-12 flex justify-center items-center">
        <Image
          src="/scentra.svg"
          alt="Scentra Logo"
          width={300}
          height={147}
          priority
          className="-mt-4"
        />
      </div>

      {/* Auth Container */}
      <div className="w-full max-w-md">
        {/* Toggle Buttons */}
        <div className="flex mb-8 border-b border-gray-200">
          <button
            className={`flex-1 py-4 text-center font-medium ${
              isLogin
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-black'
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium ${
              !isLogin
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-black'
            }`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => {
          e.preventDefault();
          // Form submission logic will be added here
        }} className="space-y-6" suppressHydrationWarning={true}>
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Enter your full name"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#D9D9D9] text-black font-medium rounded-md hover:bg-[#CCCCCC] transition-colors"
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        {isLogin && (
          <p className="mt-4 text-center">
            <a href="#" className="text-sm text-black hover:underline">
              Forgot your password?
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
