'use client';

import { useState } from 'react';
import type { Order } from '@/app/types';

interface PaymentStatusModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
}

export default function PaymentStatusModal({ 
  order, 
  onClose, 
  onStatusChange 
}: PaymentStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define valid payment status transitions based on current status
  const getValidPaymentOptions = (currentStatus: string): string[] => {
    // Return all possible payment statuses regardless of current status
    // This allows changing from any payment status to any other payment status
    const allStatuses = [
      'awaiting_payment',
      'paid',
      'refunded'
    ];
    
    // Filter out the current status to prevent changing to the same status
    return allStatuses.filter(status => status !== currentStatus);
  };
  
  const validOptions = getValidPaymentOptions(order.paymentStatus);
  
  const handleSubmit = async () => {
    if (!selectedStatus) return;
    
    setIsSubmitting(true);
    try {
      await onStatusChange(order.id, selectedStatus);
    } catch (error) {
      console.error('Error changing payment status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Change Payment Status</h3>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Order ID: <span className="font-medium">{order.id.slice(0, 8)}</span>
          </p>
          
          <div className="mb-4">
            <p className="mb-2 text-sm text-gray-600">
              Current payment status: 
              <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                order.paymentStatus === 'refunded' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.paymentStatus === 'awaiting_payment' ? 'Awaiting Payment' :
                 order.paymentStatus === 'paid' ? 'Paid' : 'Refunded'}
              </span>
            </p>
          </div>
          
          {validOptions.length === 0 ? (
            <p className="text-amber-600 mb-4">
              This payment status cannot be changed to any other status.
            </p>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select new payment status:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                >
                  <option value="">Select a status</option>
                  {validOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === 'awaiting_payment' ? 'Awaiting Payment' :
                       status === 'paid' ? 'Paid' : 'Refunded'}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedStatus === 'paid' && (
                <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700">
                  <p className="text-sm">
                    <strong>Note:</strong> Marking as paid will automatically change all related listing statuses to "unconfirmed", 
                    indicating they are ready for processing.
                  </p>
                </div>
              )}
              
              {selectedStatus === 'refunded' && (
                <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-400 text-amber-700">
                  <p className="text-sm">
                    <strong>Note:</strong> Make sure you have actually processed the refund through the payment provider 
                    before marking this order as refunded.
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
                  : selectedStatus === 'refunded'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : selectedStatus === 'paid'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-black hover:bg-gray-800'
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Update Payment Status'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
