'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminNav() {
  const pathname = usePathname();
  
  const navItems = [
    { 
      label: 'Listings', 
      path: '/admin/listings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ) 
    },
    { 
      label: 'Orders', 
      path: '/admin/orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ) 
    }
  ];
  
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <nav className="flex overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path || 
                           (pathname?.startsWith(item.path) && item.path !== '/admin');
                           
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center py-4 px-6 border-b-2 text-sm font-medium transition-colors whitespace-nowrap
                  ${isActive 
                    ? 'border-black text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
