'use client';

interface BuyerInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuyerInstructionsModal({ isOpen, onClose }: BuyerInstructionsModalProps) {
  // Handle click outside the modal content to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();  
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">How It Works</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-5">
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="font-medium text-lg">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-lg mb-1">Send Payment</h3>
                <p className="text-gray-600">
                  Send your total payment via <strong>Venmo or PayPal</strong> to Scentra (details provided after checkout).
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="font-medium text-lg">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-lg mb-1">Payment Confirmation</h3>
                <p className="text-gray-600">
                  Once Scentra confirms your payment, we'll notify the seller to confirm the sale.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="font-medium text-lg">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-lg mb-1">Seller Ships to Scentra</h3>
                <p className="text-gray-600">
                  After the seller confirms, they ship the fragrance to our verification center.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="font-medium text-lg">4</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-lg mb-1">Authentication & Quality Check</h3>
                <p className="text-gray-600">
                  Our experts verify the fragrance for authenticity, condition, and volume.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="font-medium text-lg">5</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-lg mb-1">Fragrance is Shipped to You</h3>
                <p className="text-gray-600">
                  If everything checks out, we release the payment to the seller and ship the verified fragrance to you.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Payment Methods</h3>
            <p className="text-gray-700">
              <span className="font-medium">Venmo:</span> @scentra<br />
              <span className="font-medium">PayPal:</span> @Scentra1
            </p>
          </div>
        </div>
        
        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
