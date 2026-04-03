import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';

interface FooterProps {
  onPageChange: (page: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onPageChange }) => {
  return (
    <footer className="relative z-20 bg-gray-900 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <span className="font-display font-black text-3xl text-[#ff5e00] tracking-tighter mb-6 block">
              ABA HEALTH
            </span>
            <p className="text-gray-400 font-medium mb-6">
              Premium dietary supplements formulated for maximum efficacy and daily wellness.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ff5e00] transition-colors p-2"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ff5e00] transition-colors p-2"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ff5e00] transition-colors p-2"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-4 text-gray-400 font-medium">
              <li><button onClick={() => { onPageChange('home'); setTimeout(() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-white transition-colors">All Products</button></li>
              <li><button onClick={() => { onPageChange('home'); setTimeout(() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-white transition-colors">Vitamins & Minerals</button></li>
              <li><button onClick={() => { onPageChange('home'); setTimeout(() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-white transition-colors">Omega & Fish Oils</button></li>
              <li><button onClick={() => { onPageChange('home'); setTimeout(() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-white transition-colors">Proteins</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-wider">Company</h4>
            <ul className="space-y-4 text-gray-400 font-medium">
              <li><button onClick={() => onPageChange('about')} className="hover:text-white transition-colors">About Us</button></li>
              <li><button onClick={() => onPageChange('science')} className="hover:text-white transition-colors">Our Science</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-wider">Support</h4>
            <ul className="space-y-4 text-gray-400 font-medium">
              <li><button onClick={() => onPageChange('contact')} className="hover:text-white transition-colors">Contact Us</button></li>
              <li><button onClick={() => onPageChange('privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm font-medium">
          <p>&copy; {new Date().getFullYear()} ABA Health. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button onClick={() => onPageChange('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
