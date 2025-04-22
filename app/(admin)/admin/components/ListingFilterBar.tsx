'use client';

interface ListingFilterBarProps {
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
}

export default function ListingFilterBar({
  statusFilter,
  onStatusFilterChange
}: ListingFilterBarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Listing Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Listing Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="block w-full min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="unconfirmed">Unconfirmed</option>
              <option value="shipping_to_scentra">Shipping to Scentra</option>
              <option value="verifying">Verifying</option>
              <option value="shipping_to_buyer">Shipping to Buyer</option>
              <option value="completed">Completed</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>
        
        {/* Reset Button */}
        <button
          onClick={() => onStatusFilterChange('all')}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
