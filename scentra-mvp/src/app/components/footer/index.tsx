import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Scentra</span>
            </Link>
            <p className="mt-2 text-gray-400 text-sm">
              The premier peer-to-peer marketplace for fragrances
            </p>
          </div>
          
          <div className="mt-8 md:mt-0">
            <h3 className="text-lg font-semibold mb-4 text-center md:text-right">Contact Us</h3>
            <p className="text-gray-400 text-center md:text-right">
              <a href="mailto:support@scentra.com" className="hover:text-white">
                support@scentra.com
              </a>
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-gray-400 text-center">
          <p>© {new Date().getFullYear()} Scentra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
