'use client';

import Image from 'next/image';
import { useState } from 'react';
import Header from '../../components/layout/Header';

type SizeOption = '50mL' | '100mL' | '200mL';
type Condition = 'New' | 'Used';

export default function ProductPage() {
  const [selectedSize, setSelectedSize] = useState<SizeOption>('100mL');
  const [isReturnPolicyOpen, setReturnPolicyOpen] = useState(false);
  const [isVerificationOpen, setVerificationOpen] = useState(false);
  const [condition, setCondition] = useState<Condition>('New');
  const [percentage, setPercentage] = useState<number>(100);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isConditionOpen, setIsConditionOpen] = useState(false);
  const [isPercentageOpen, setIsPercentageOpen] = useState(false);

  const percentageOptions = [25, 50, 75, 90, 95];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column - Image */}
          <div className="relative aspect-square">
            <Image
              src="/fragrances/bleu.jpg"
              alt="Bleu de Chanel"
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>

          {/* Right Column - Product Info */}
          <div className="relative flex flex-col h-full">
            {/* Non-clickable elements */}
            <div>
              <div className="space-y-3 mb-6">
                <h2 className="text-xl font-medium text-gray-700 tracking-wide">CHANEL</h2>
                <h1 className="text-4xl font-semibold text-black tracking-tight">Bleu de Chanel</h1>
                <p className="text-3xl font-semibold text-black mt-6">$145</p>
              </div>

              <div className="space-y-6">
              {/* Size Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsSizeOpen(!isSizeOpen)}
                  className="w-full p-4 border rounded-lg text-gray-900 border-gray-300 focus:outline-none focus:border-black transition-colors bg-white"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900">Size: {selectedSize}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {isSizeOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                    {['50mL', '100mL', '200mL'].map((size) => (
                      <button
                        key={size}
                        className="w-full p-4 text-left text-gray-900 hover:bg-gray-50"
                        onClick={() => {
                          setSelectedSize(size as SizeOption);
                          setIsSizeOpen(false);
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            {/* Condition and Percentage */}
            <div className="space-y-6">
              <div className="relative">
                <button
                  onClick={() => setIsConditionOpen(!isConditionOpen)}
                  className="w-full p-4 border rounded-lg text-gray-900 border-gray-300 focus:outline-none focus:border-black transition-colors bg-white"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900">Condition: {condition}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {isConditionOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                    {['New', 'Used'].map((cond) => (
                      <button
                        key={cond}
                        className="w-full p-4 text-left text-gray-900 hover:bg-gray-50"
                        onClick={() => {
                          setCondition(cond as Condition);
                          setIsConditionOpen(false);
                        }}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {condition === 'Used' && (
                <div className="relative">
                  <button
                    onClick={() => setIsPercentageOpen(!isPercentageOpen)}
                    className="w-full p-4 border rounded-lg text-gray-900 border-gray-300 focus:outline-none focus:border-black transition-colors bg-white"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Percentage Full: {percentage}%</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {isPercentageOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                      {percentageOptions.map((p) => (
                        <button
                          key={p}
                          className="w-full p-4 text-left text-gray-900 hover:bg-gray-50"
                          onClick={() => {
                            setPercentage(p);
                            setIsPercentageOpen(false);
                          }}
                        >
                          {p}% Full
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {}} // Will implement later
                className="w-full py-4 text-white bg-black rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Add to Cart
              </button>
              <button
                onClick={() => {}} // Will implement later
                className="w-full py-4 text-black bg-white border-2 border-black rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Sell
              </button>
            </div>

              {/* Info Links */}
              <div className="absolute bottom-0 left-0 right-0 space-y-2 text-center">
                <div>
                  <button
                    onClick={() => setReturnPolicyOpen(true)}
                    className="font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    Return Policy
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => setVerificationOpen(true)}
                    className="font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    Verification Information
                  </button>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Return Policy Modal */}
      {isReturnPolicyOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
            <h3 className="text-2xl font-semibold mb-6 text-black">Return Policy</h3>
            <p className="text-gray-700 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <button
              onClick={() => setReturnPolicyOpen(false)}
              className="w-full mt-4 p-4 text-white bg-black rounded-lg hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {isVerificationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
            <h3 className="text-2xl font-semibold mb-6 text-black">Verification Information</h3>
            <p className="text-gray-700 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <button
              onClick={() => setVerificationOpen(false)}
              className="w-full mt-4 p-4 text-white bg-black rounded-lg hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
