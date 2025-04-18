'use client';

import { useState } from 'react';
import type { Listing } from '@/app/types';
import { STATUS_LABELS } from '@/app/types';

interface StatusChangeModalProps {
  listing: Listing;
  validStatusOptions: string[];
  onClose: () => void;
  onStatusChange: (listingId: string, newStatus: string) => void;
}

export default function StatusChangeModal({
  listing,
  validStatusOptions,
  onClose,
  onStatusChange
}: StatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    
    setIsSubmitting(true);
    await onStatusChange(listing.id, selectedStatus);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Change Listing Status</h3>
        </div>
        
        <div className="p-6">
          <p className="mb-4 text-sm text-gray-600">
            Current status: <span className="font-medium">{STATUS_LABELS[listing.status] || listing.status}</span>
          </p>
          
          {validStatusOptions.length === 0 ? (
            <p className="text-amber-600 mb-4">
              This listing cannot be changed to any other status.
              {listing.status === 'removed' && " Once a listing is removed, its status cannot be changed."}
            </p>
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select new status:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-black focus:border-black mb-4"
              >
                <option value="">Select a status</option>
                {validStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status] || status}
                  </option>
                ))}
              </select>
              
              {selectedStatus === 'removed' && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700">
                  <p className="text-sm">
                    <strong>Warning:</strong> Once a listing is removed, it cannot be restored to active status.
                    This action cannot be undone.
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
          
          {validStatusOptions.length > 0 && (
            <button
              onClick={handleSubmit}
              disabled={!selectedStatus || isSubmitting}
              className={`px-4 py-2 text-white rounded-md ${
                !selectedStatus || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : selectedStatus === 'removed'
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
