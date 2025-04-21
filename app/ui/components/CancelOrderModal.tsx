'use client';

import { useState } from 'react';
import { Order } from '@/app/types';

interface CancelOrderModalProps {
  order: Order;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  canCancel: boolean;
}

export default function CancelOrderModal({ 
  order, 
  onClose, 
  onConfirm, 
  canCancel 
}: CancelOrderModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!canCancel) return;
    
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">
            {canCancel ? 'Cancel Order' : 'Contact Support'}
          </h3>
        </div>
        
        <div className="p-6">
          {canCancel ? (
            <>
              <p className="mb-4">
                Are you sure you want to cancel order #{order.id.slice(0, 8)}?
              </p>
              <p className="mb-4 text-sm text-gray-600">
                This will cancel your order and return all items to the marketplace.
              </p>
              <p className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm">
                <strong>Note:</strong> If you decide to place the order again, the items may no longer be available.
              </p>
            </>
          ) : (
            <>
              <p className="mb-4">
                This order cannot be automatically cancelled because payment has already been processed.
              </p>
              <p className="mb-4 text-sm text-gray-600">
                To request cancellation, please email us at <a href="mailto:support@scentra.com" className="text-indigo-600 hover:text-indigo-800">support@scentra.com</a> with your order number: <span className="font-medium">{order.id.slice(0, 8)}</span>
              </p>
              <p className="p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm">
                <strong>Note:</strong> Refunds for processed payments typically take 3-5 business days to appear on your account.
              </p>
            </>
          )}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {canCancel ? 'Keep Order' : 'Close'}
          </button>
          
          {canCancel && (
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
            >
              {isProcessing ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
