'use client';

import { useState } from 'react';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/app/types';
import type { Order } from '@/app/types';

interface OrderStatusModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
}

export default function OrderStatusModal({ 
  order, 
  onClose, 
  onStatusChange 
}: OrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define valid status transitions
  const getValidStatusOptions = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case 'pending':
        return ['processing', 'cancelled'];
      case 'processing':
        return ['shipped', 'cancelled'];
      case 'shipped':
        return ['delivered', 'cancelled'];
      case 'delivered':
        return ['cancelled']; // Can still cancel if needed
      case 'cancelled':
        return ['pending']; // Can reactivate if cancelled by mistake
      default:
        return ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    }
  };
  
  const validOptions = getValidStatusOptions(order.orderStatus);
  
  const handleSubmit = async () => {
    if (!selectedStatus) return;
    
    setIsSubmitting(true);
    try {
      await onStatusChange(order.id, selectedStatus);
    } catch (error) {
      console.error('Error changing order status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Change Order Status</h3>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Order ID: <span className="font-medium">{order.id.slice(0, 8)}</span>
          </p>
          
          <div className="mb-4">
            <p className="mb-2 text-sm text-gray-600">
              Current status: 
              <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                ORDER_STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-800'
              }`}>
                {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
              </span>
            </p>
          </div>
          
          {validOptions.length === 0 ? (
            <p className="text-amber-600 mb-4">
              This order cannot be changed to any other status.
            </p>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select new status:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                >
                  <option value="">Select a status</option>
                  {validOptions.map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_LABELS[status] || status}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedStatus === 'cancelled' && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700">
                  <p className="text-sm">
                    <strong>Warning:</strong> Cancelling an order will not automatically revert listings 
                    that have already been processed. If payment has been made, consider reaching out 
                    to the buyer and seller first.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          
          {validOptions.length > 0 && (
            <button
              onClick={handleSubmit}
              disabled={!selectedStatus || isSubmitting}
              className={`px-4 py-2 text-white rounded-md ${
                !selectedStatus || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : selectedStatus === 'cancelled'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-black hover:bg-gray-800'
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
