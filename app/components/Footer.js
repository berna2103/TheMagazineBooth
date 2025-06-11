import { Instagram, Twitter, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-red-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="#" className="text-gray-600 hover:text-gray-500">
            <span className="sr-only">Instagram</span>
            <Instagram />
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-500">
            <span className="sr-only">Twitter</span>
            <Twitter />
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-500">
            <span className="sr-only">Facebook</span>
            <Facebook />
          </a>
        </div>
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-base text-gray-600">
            © {new Date().getFullYear()} Magazine Booth Rental. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}