'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Order, OrderItem, ShippingAddress } from '@/app/types';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/app/types';

interface OrderDetailsProps {
  order: Order;
  items: OrderItem[];
  onCancelOrder?: () => void;
}

export default function OrderDetails({ order, items, onCancelOrder }: OrderDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  // Parse the shipping address from JSON if needed
  const getShippingAddress = (): ShippingAddress => {
    if (typeof order.shippingAddress === 'string') {
      return JSON.parse(order.shippingAddress) as ShippingAddress;
    }
    return order.shippingAddress as ShippingAddress;
  };
  
  const shippingAddress = getShippingAddress();
  
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
      <div 
        className="px-6 py-4 flex justify-between items-center bg-gray-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold">
          Order Details
        </h3>
        <button className="text-gray-500 focus:outline-none">
          <svg 
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-6 space-y-6">
          <div className="flex justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              {/* Order Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Order Status</h4>
                <div className="flex items-center">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${ORDER_STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
                    {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
                  </span>
                </div>
              </div>
              
              {/* Payment Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Status</h4>
                <div className="flex items-center">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                      order.paymentStatus === 'refunded' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {order.paymentStatus === 'awaiting_payment' ? 'Awaiting Payment' :
                    order.paymentStatus === 'paid' ? 'Paid' : 'Refunded'}
                  </span>
                </div>
              </div>
              
              {/* Payment Method */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Method</h4>
                <p className="text-gray-900">
                  {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                </p>
              </div>
              
              {/* Total */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Order Total</h4>
                <p className="text-gray-900 font-medium">{formatPrice(order.total)}</p>
              </div>
            </div>
            
            {/* Cancel Order Button */}
            {onCancelOrder && order.orderStatus !== 'cancelled' && (
              <div className="ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelOrder();
                  }}
                  className="px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
          
          {/* Shipping Address */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h4>
            <div className="text-gray-900">
              <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
              <p>{shippingAddress.addressLine1}</p>
              {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
              <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
              <p>{shippingAddress.country}</p>
              <p>Phone: {shippingAddress.phone}</p>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-4">Order Items</h4>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex border rounded-lg p-4">
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.fragranceName}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">{item.fragranceName}</h5>
                        <p className="text-sm text-gray-500">{item.brand}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.bottleSize} • {item.condition}
                          {item.condition === 'used' && item.percentRemaining !== undefined && ` • ${item.percentRemaining}% remaining`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatPrice(item.price)}</p>
                        <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${ORDER_STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-800'}`}>
                          {ORDER_STATUS_LABELS[item.status] || item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Payment Instructions */}
          {order.paymentStatus === 'awaiting_payment' && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Instructions</h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm mb-2">
                  Please complete your payment via {order.paymentMethod === 'venmo' ? 'Venmo' : 'PayPal'}:
                </p>
                <div className="text-sm font-medium">
                  <p className="mb-1">{order.paymentInstructions}</p>
                  <p>Amount: {formatPrice(order.total)}</p>
                  <p>Reference: Order #{order.id.slice(0, 8)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
