'use client';

import React from 'react';
import Image from 'next/image';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        {/* About Us Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg mb-16 relative">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-200 to-transparent opacity-70"></div>
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-white to-transparent opacity-20"></div>
            
            <div className="relative z-10 px-8 py-20 md:px-16">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 tracking-tight">About Us</h1>
              
              <div className="max-w-3xl">
                <p className="text-2xl md:text-3xl font-medium text-gray-800 leading-tight mb-6">
                  <span className="font-bold">Three founders. One mission:</span> to bring trust, transparency, and community to fragrance resale.
                </p>
                
                <div className="h-1 w-24 bg-gradient-to-r from-gray-400 to-gray-700 rounded-full mb-8"></div>
                
                <div className="text-lg text-gray-700 space-y-6">
                  <p className="leading-relaxed">
                    We started Scentra not just because we love fragrance — but because we were frustrated buyers and sellers ourselves. 
                    Between knockoff bottles, ghost listings, and a lack of centralized platforms, the fragrance resale market felt like the Wild West.
                  </p>
                  <p className="font-semibold text-xl text-gray-800">So we decided to fix it.</p>
                  <p className="leading-relaxed">
                    We believe every scent tells a story, and so should the journey behind how it's bought and sold.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Team Photos - Interactive Cards */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Meet Our Team</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {/* Logan */}
              <div className="group relative overflow-hidden rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image 
                    src="/team/logcropped.jpeg" 
                    alt="Logan Hine" 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-0 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-bold text-2xl text-white mb-2 group-hover:text-white">Logan Hine</h3>
                  <p className="text-white/0 group-hover:text-white/90 transition-colors duration-300 text-base">CEO/Founder</p>
                </div>
              </div>
              
              {/* Vu */}
              <div className="group relative overflow-hidden rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image 
                    src="/team/vucropped.jpeg" 
                    alt="Matthew Vu" 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-0 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-bold text-2xl text-white mb-2 group-hover:text-white">Matthew Vu</h3>
                  <p className="text-white/0 group-hover:text-white/90 transition-colors duration-300 text-base">CTO/Founder</p>
                </div>
              </div>
              
              {/* Kim */}
              <div className="group relative overflow-hidden rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image 
                    src="/team/kimcropped.jpg" 
                    alt="Matthew Kim" 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-0 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-bold text-2xl text-white mb-2 group-hover:text-white">Matthew Kim</h3>
                  <p className="text-white/0 group-hover:text-white/90 transition-colors duration-300 text-base">CMO/Founder</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mission Statement */}
          <div className="bg-gray-50 rounded-xl p-10 shadow-inner">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We're three Harvard students passionate about fixing what's broken. We've built products from 0 to 1, 
                helped scale companies, and studied market inefficiencies up close. Now, we're channeling that energy 
                into reimagining how fragrance is bought and sold online — with trust, transparency, and design at the center.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;