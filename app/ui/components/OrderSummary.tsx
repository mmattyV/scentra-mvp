'use client';

import Image from 'next/image';
import type { CartItem } from '@/app/types';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
}

export default function OrderSummary({ items, subtotal }: OrderSummaryProps) {
  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  // Calculate verification fee (3% of subtotal)
  const verificationFee = subtotal * 0.03;
  
  // Calculate total with verification fee
  const total = subtotal + verificationFee;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
      
      <ul className="divide-y divide-gray-200 mb-4">
        {items.map((item) => (
          <li key={item.id} className="py-4 flex">
            <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={item.imageUrl}
                alt={item.fragranceName}
                fill
                className="object-cover"
              />
            </div>
            <div className="ml-4 flex-1 flex flex-col">
              <div>
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    {item.fragranceName}
                  </h3>
                  <p className="text-sm font-medium text-gray-900">{formatPrice(item.currentPrice)}</p>
                </div>
                <p className="mt-1 text-sm text-gray-500">{item.brand}</p>
              </div>
              <div className="flex-1 flex items-end">
                <p className="text-xs text-gray-500">
                  {item.bottleSize} • {item.condition}
                  {item.condition === 'used' && item.percentRemaining !== undefined && ` • ${item.percentRemaining}% remaining`}
                  {` • ${item.hasOriginalBox ? 'With original box' : 'No original box'}`}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Subtotal</span>
          <span className="text-sm font-medium">{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Verification Fee (3%)</span>
          <span className="text-sm font-medium">{formatPrice(verificationFee)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Shipping</span>
          <span className="text-sm font-medium">Included</span>
        </div>
        
        <div className="flex justify-between border-t border-dashed border-gray-200 pt-3">
          <span className="text-base font-medium">Total</span>
          <span className="text-base font-bold">{formatPrice(total)}</span>
        </div>
      </div>
      
      <p className="mt-4 text-xs text-gray-500">
        By completing your purchase, you agree to Scentra's terms of service. All fragrances will be verified by Scentra before shipping to the buyer.
      </p>
    </div>
  );
}
