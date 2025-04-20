'use client';

import React, { useState } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Header from '../components/layout/Header';

// FAQ Category interfaces
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  name: string;
  items: FAQItem[];
}

const FAQPage = () => {
  // FAQ data organized by categories
  const faqCategories: FAQCategory[] = [
    {
      name: "Authentication",
      items: [
        {
          question: "How does Scentra verify that a fragrance is authentic?",
          answer: "Scentra uses a multistep process to verify each fragrance sold on our platform. We begin by physically examining the product. We carefully check the glass quality, engraving, labeling, sprayer, cap fit, and inner tubes. We also do a batch code check and ensure that it matches across the bottle and box. Finally, we do a scent check to ensure that the correct notes and longevity are upheld."
        },
        {
          question: "What happens if I receive a counterfeit or damaged item?",
          answer: "In the rare case that you receive an item that is counterfeit or damaged, don't worry. Scentra will fully cover the purchase through our authentication guarantee. Just contact our support team within 48 hours of delivery, and we'll either refund your money or provide a replacement when available."
        },
        {
          question: "What if I don't receive my order?",
          answer: "If your tracking hasn't updated or your order is lost in transit, reach out to us. We'll investigate and either resend or refund your purchase."
        },
        {
          question: "What happens if the buyer claims the item is fake but it's not?",
          answer: "All disputes are resolved through Scentra's internal review process, which involves reviewing authentication records and shipping documentation. We protect both parties fairly."
        }
      ]
    },
    {
      name: "Selling",
      items: [
        {
          question: "How do I list a fragrance for sale?",
          answer: "Listing is simple: create a Scentra account, upload photos of your fragrance, enter key details (brand, size, usage level), set a price, and submit for review. Once approved, it's live for buyers to view and purchase."
        },
        {
          question: "What types of fragrances can I sell on Scentra?",
          answer: "We accept new and gently used designer, niche, and luxury fragrances. Fragrances must be authentic, have no tampering, and contain a clearly visible fill level. We currently don't allow decants or samples."
        },
        {
          question: "Can I sell a fragrance without the original box?",
          answer: "Yes — fragrances without original packaging are accepted, but this must be clearly noted in your listing and shown in your photos."
        },
        {
          question: "Can I sell anonymously?",
          answer: "Yes. Buyer and seller identities are kept private — we handle all communication and fulfillment through our platform."
        }
      ]
    },
    {
      name: "Shipping",
      items: [
        {
          question: "Who pays for shipping?",
          answer: "Buyers cover the cost of shipping at checkout. Scentra provides a prepaid shipping label for sellers to send the item to our authentication center."
        },
        {
          question: "How long does it take to receive my order?",
          answer: "Most orders arrive within 7–10 business days. This includes time for the seller to ship the item to Scentra, our authentication process, and final delivery to you."
        },
        {
          question: "Do you offer international shipping?",
          answer: "Currently, Scentra only operates within the United States. We're actively exploring international expansion — stay tuned!"
        }
      ]
    },
    {
      name: "Payments and Refunds",
      items: [
        {
          question: "How does payment work for buyers and sellers?",
          answer: "Buyers pay upfront through our secure checkout system. Funds are held by Scentra until the item passes authentication, then released to the seller."
        },
        {
          question: "When do I get paid as a seller?",
          answer: "Sellers receive payment 1–2 business days after the item successfully passes authentication and ships to the buyer."
        },
        {
          question: "What's your return or refund policy?",
          answer: "All sales are final to maintain trust and fairness for sellers. However, if an item is inauthentic, damaged, or not as described, we'll offer a full refund or replacement."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* FAQ Section */}
        <section>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg mb-16 relative">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-200 to-transparent opacity-70"></div>
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-white to-transparent opacity-20"></div>
            
            <div className="relative z-10 px-8 py-16 md:px-16">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 tracking-tight">Frequently Asked Questions</h1>
              
              <div className="max-w-3xl">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  Everything you need to know about how Scentra works, from authentication to shipping and everything in between.
                </p>
                
                <div className="h-1 w-24 bg-gradient-to-r from-gray-400 to-gray-700 rounded-full mt-6"></div>
              </div>
            </div>
          </div>
        
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{category.name}</h2>
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <Disclosure key={itemIndex} as="div" className="border border-gray-200 rounded-lg">
                    {({ open }: { open: boolean }) => (
                      <>
                        <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-left text-gray-800 font-medium bg-white hover:bg-gray-50 rounded-lg focus:outline-none focus-visible:ring focus-visible:ring-gray-300">
                          <span>{item.question}</span>
                          <ChevronDownIcon
                            className={`${
                              open ? 'transform rotate-180' : ''
                            } w-5 h-5 text-gray-500`}
                          />
                        </Disclosure.Button>
                        <Transition
                          show={open}
                          enter="transition duration-100 ease-out"
                          enterFrom="transform scale-95 opacity-0"
                          enterTo="transform scale-100 opacity-100"
                          leave="transition duration-75 ease-out"
                          leaveFrom="transform scale-100 opacity-100"
                          leaveTo="transform scale-95 opacity-0"
                        >
                          <Disclosure.Panel className="px-4 py-3 text-gray-700 bg-gray-50 rounded-b-lg">
                            {item.answer}
                          </Disclosure.Panel>
                        </Transition>
                      </>
                    )}
                  </Disclosure>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      </main>
    </div>
  );
};

export default FAQPage;
