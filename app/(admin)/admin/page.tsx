'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/admin/listings');
  }, [router]);
  
  return (
    <div className="container mx-auto px-4 py-16 flex-grow">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent"></div>
      </div>
    </div>
  );
}
