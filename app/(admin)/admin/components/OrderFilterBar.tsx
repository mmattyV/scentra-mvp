'use client';

interface OrderFilterBarProps {
  statusFilter: string;
  paymentFilter: string;
  onStatusFilterChange: (filter: string) => void;
  onPaymentFilterChange: (filter: string) => void;
}

export default function OrderFilterBar({
  statusFilter,
  paymentFilter,
  onStatusFilterChange,
  onPaymentFilterChange
}: OrderFilterBarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Order Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="block w-full min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* Payment Status Filter */}
          <div>
            <label htmlFor="paymentFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              id="paymentFilter"
              value={paymentFilter}
              onChange={(e) => onPaymentFilterChange(e.target.value)}
              className="block w-full min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black text-sm"
            >
              <option value="all">All Payments</option>
              <option value="awaiting_payment">Awaiting Payment</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
        
        {/* Reset Button */}
        <button
          onClick={() => {
            onStatusFilterChange('all');
            onPaymentFilterChange('all');
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
