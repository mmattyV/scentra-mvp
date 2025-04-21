'use client';

import { useState, FormEvent } from 'react';
import type { ShippingAddress } from '@/app/types';

interface ShippingFormProps {
  onSubmit: (shippingAddress: ShippingAddress, paymentMethod: 'venmo' | 'paypal') => void;
  isSubmitting: boolean;
}

export default function ShippingForm({ onSubmit, isSubmitting }: ShippingFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'venmo' | 'paypal'>('venmo');
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!addressLine1.trim()) errors.addressLine1 = 'Address is required';
    if (!city.trim()) errors.city = 'City is required';
    if (!state.trim()) errors.state = 'State is required';
    if (!zipCode.trim()) errors.zipCode = 'ZIP code is required';
    if (!phone.trim()) errors.phone = 'Phone number is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const shippingAddress: ShippingAddress = {
      firstName,
      lastName,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
      state,
      zipCode,
      country,
      phone
    };
    
    onSubmit(shippingAddress, paymentMethod);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`mt-1 block w-full rounded-md border ${
              validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm`}
          />
          {validationErrors.firstName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={`mt-1 block w-full rounded-md border ${
              validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm`}
          />
          {validationErrors.lastName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
          Address Line 1
        </label>
        <input
          type="text"
          id="addressLine1"
          name="addressLine1"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          className={`mt-1 block w-full rounded-md border ${
            validationErrors.addressLine1 ? 'border-red-500' : 'border-gray-300'
          } px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm`}
        />
        {validationErrors.addressLine1 && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.addressLine1}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
          Address Line 2 (Optional)
        </label>
        <input
          type="text"
          id="addressLine2"
          name="addressLine2"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={`mt-1 block w-full rounded-md border ${
              validationErrors.city ? 'border-red-500' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm`}
          />
          {validationErrors.city && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State / Province
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className={`mt-1 block w-full rounded-md border ${
              validationErrors.state ? 'border-red-500' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm`}
          />
          {validationErrors.state && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.state}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
            ZIP / Postal Code
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className={`mt-1 block w-full rounded-md border ${
              validationErrors.zipCode ? 'border-red-500' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm`}
          />
          {validationErrors.zipCode && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.zipCode}</p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
          Country
        </label>
        <select
          id="country"
          name="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
        >
          <option value="United States">United States</option>
          <option value="Canada">Canada</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`mt-1 block w-full rounded-md border ${
            validationErrors.phone ? 'border-red-500' : 'border-gray-300'
          } px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm`}
        />
        {validationErrors.phone && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
        )}
      </div>
      
      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">Payment Method</span>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`border rounded-lg p-4 cursor-pointer flex items-center ${
              paymentMethod === 'venmo' ? 'border-black bg-gray-50' : 'border-gray-300'
            }`}
            onClick={() => setPaymentMethod('venmo')}
          >
            <input
              type="radio"
              id="venmo"
              name="paymentMethod"
              checked={paymentMethod === 'venmo'}
              onChange={() => setPaymentMethod('venmo')}
              className="h-4 w-4 text-black focus:ring-black border-gray-300"
            />
            <label htmlFor="venmo" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
              Venmo
            </label>
          </div>
          
          <div
            className={`border rounded-lg p-4 cursor-pointer flex items-center ${
              paymentMethod === 'paypal' ? 'border-black bg-gray-50' : 'border-gray-300'
            }`}
            onClick={() => setPaymentMethod('paypal')}
          >
            <input
              type="radio"
              id="paypal"
              name="paymentMethod"
              checked={paymentMethod === 'paypal'}
              onChange={() => setPaymentMethod('paypal')}
              className="h-4 w-4 text-black focus:ring-black border-gray-300"
            />
            <label htmlFor="paypal" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
              PayPal
            </label>
          </div>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
          isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        ) : (
          'Complete Order'
        )}
      </button>
    </form>
  );
}
