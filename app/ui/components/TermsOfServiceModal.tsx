'use client';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsOfServiceModal({ isOpen, onClose, onAccept }: TermsOfServiceModalProps) {
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
          <h2 className="text-xl font-semibold text-gray-900">Terms of Service</h2>
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
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 text-lg">Purchase Agreement</h3>
            <p className="text-gray-600">
              By completing your purchase, you agree to Scentra's Terms of Service. All sales are final. Your fragrance will be authenticated and inspected before being shipped to you.
            </p>
            
            <h3 className="font-medium text-gray-900 text-lg mt-6">Authentication Process</h3>
            <p className="text-gray-600">
              All fragrances sold through Scentra undergo a thorough authentication and quality inspection process. Our experts verify the authenticity, condition, and volume of each fragrance before it is shipped to you.
            </p>
            
            <h3 className="font-medium text-gray-900 text-lg mt-6">Payment and Shipping</h3>
            <p className="text-gray-600">
              Payment is processed upon checkout and held securely until the authentication process is complete. Once verified, your fragrance will be shipped to the address provided during checkout.
            </p>
            
            <h3 className="font-medium text-gray-900 text-lg mt-6">Refund Policy</h3>
            <p className="text-gray-600">
              All sales are final once the authentication process is complete and the fragrance has been shipped. If a fragrance fails our authentication process, you will receive a full refund.
            </p>
            
            <h3 className="font-medium text-gray-900 text-lg mt-6">Privacy</h3>
            <p className="text-gray-600">
              Your personal information is handled in accordance with our Privacy Policy. We collect and use your information only as necessary to process your order and provide our services.
            </p>
          </div>
        </div>
        
        <div className="border-t px-6 py-4 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
}
