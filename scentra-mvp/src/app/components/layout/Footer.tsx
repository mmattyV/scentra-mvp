'use client';

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}
          <Image
            src="/scentra.svg"
            alt="Scentra Logo"
            width={150}
            height={74}
            priority
          />
          
          {/* Email Icon */}
          <a
            href="mailto:contact@scentra.app"
            className="text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Contact us via email"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </a>

          {/* Copyright Text */}
          <p className="text-gray-600 text-sm tracking-wide uppercase">
            2025 © SCENTRA | ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </footer>
  );
}
