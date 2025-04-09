'use client';

import Image from 'next/image';
import Header from '../components/layout/Header';

type OrderStatus = 'unconfirmed' | 'confirmed' | 'shipping_to_scentra' | 'verifying' | 'shipping_to_buyer' | 'completed';

interface OrderItem {
  id: number;
  productId: string;
  name: string;
  brand: string;
  pricePaid: number;
  image: string;
  status: OrderStatus;
  orderDate: string;
}

const SAMPLE_ORDERS: OrderItem[] = [
  {
    id: 1,
    productId: 'BDC-100ML-NEW-001',
    name: 'Bleu de Chanel',
    brand: 'CHANEL',
    pricePaid: 145,
    image: '/fragrances/bleu.jpg',
    status: 'unconfirmed',
    orderDate: '2025-04-08'
  },
  {
    id: 2,
    productId: 'SVG-50ML-USED-023',
    name: 'Sauvage',
    brand: 'Dior',
    pricePaid: 85,
    image: '/fragrances/sauvage.jpg',
    status: 'shipping_to_scentra',
    orderDate: '2025-04-07'
  },
  {
    id: 3,
    productId: 'EROS-200ML-NEW-045',
    name: 'Eros',
    brand: 'Versace',
    pricePaid: 120,
    image: '/fragrances/eros.jpg',
    status: 'completed',
    orderDate: '2025-04-05'
  }
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  unconfirmed: 'Waiting for Seller',
  confirmed: 'Confirmed',
  shipping_to_scentra: 'Shipping to Scentra',
  verifying: 'Verifying',
  shipping_to_buyer: 'Shipping to You',
  completed: 'Delivered'
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  unconfirmed: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipping_to_scentra: 'bg-purple-100 text-purple-800',
  verifying: 'bg-orange-100 text-orange-800',
  shipping_to_buyer: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800'
};

export default function PastOrdersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Past Orders</h1>

        {/* Orders List */}
        <div className="space-y-4 mb-12">
          {SAMPLE_ORDERS.map((item) => (
            <div key={item.id} className="flex items-center p-4 sm:p-6 bg-white border rounded-lg shadow-sm">
              {/* Image */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>

              {/* Product Info */}
              <div className="flex-grow min-w-0 ml-4 sm:ml-6">
                <h3 className="text-base sm:text-lg font-medium text-black truncate">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.brand}</p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-1 sm:gap-x-4 text-sm text-gray-500 mt-1">
                  <p>Product ID: {item.productId}</p>
                  <p>Ordered: {new Date(item.orderDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3 ml-4 sm:ml-6 flex-shrink-0">
                {/* Price */}
                <div className="text-base sm:text-lg font-medium text-gray-700">
                  ${item.pricePaid}
                </div>

                {/* Status */}
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${STATUS_COLORS[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {SAMPLE_ORDERS.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No orders yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
