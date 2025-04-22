'use client';

import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/app/types';

interface OrdersTableProps {
  orders: any[];
  orderItems: Record<string, any[]>;
  buyerInfo: Record<string, any>;
  formatDate: (date: string) => string;
  onViewDetails: (order: any) => void;
  onChangeStatus: (order: any) => void;
  onChangePayment: (order: any) => void;
}

export default function OrdersTable({
  orders,
  orderItems,
  buyerInfo,
  formatDate,
  onViewDetails,
  onChangeStatus,
  onChangePayment
}: OrdersTableProps) {
  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  // Get buyer name
  const getBuyerName = (buyerId: string) => {
    const buyer = buyerInfo[buyerId];
    if (!buyer) return 'Unknown';
    
    if (buyer.firstName && buyer.lastName) {
      return `${buyer.firstName} ${buyer.lastName}`;
    }
    
    return buyer.username || buyer.email || 'Unknown';
  };
  
  // Get buyer email
  const getBuyerEmail = (buyerId: string) => {
    const buyer = buyerInfo[buyerId];
    return buyer?.email || 'No email';
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Buyer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900">
                  {order.id.slice(0, 8)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{getBuyerName(order.buyerId)}</div>
                  <div className="text-gray-500">{getBuyerEmail(order.buyerId)}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-500">
                  {(orderItems[order.id] || []).length} items
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(order.total)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button 
                  className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${ORDER_STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onChangeStatus(order)}
                >
                  {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                      order.paymentStatus === 'refunded' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}
                  onClick={() => onChangePayment(order)}
                >
                  {order.paymentStatus === 'awaiting_payment' ? 'Awaiting Payment' :
                   order.paymentStatus === 'paid' ? 'Paid' : 'Refunded'}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => onViewDetails(order)}
                  className="text-indigo-600 hover:text-indigo-900 font-medium mr-2"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
