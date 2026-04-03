import React from 'react';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onPageChange: (page: 'home' | 'about' | 'contact' | 'science' | 'privacy') => void;
  currentPage: string;
  onCartToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPageChange, currentPage, onCartToggle }) => {
  const { totalItems } = useCart();

  return (
    <header className="relative z-50 bg-white shadow-md sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onPageChange('home')}>
            <span className="font-display font-black text-3xl text-[#ff5e00] tracking-tighter">
              ABA HEALTH
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-10">
            <button 
              onClick={() => { onPageChange('home'); setTimeout(() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} 
              className={`font-bold text-sm uppercase tracking-wider transition-colors ${currentPage === 'home' ? 'text-[#ff5e00]' : 'text-gray-900 hover:text-[#ff5e00]'}`}
            >
              Products
            </button>
            <button 
              onClick={() => onPageChange('about')} 
              className={`font-bold text-sm uppercase tracking-wider transition-colors ${currentPage === 'about' ? 'text-[#ff5e00]' : 'text-gray-900 hover:text-[#ff5e00]'}`}
            >
              About Us
            </button>
            <button 
              onClick={() => onPageChange('contact')} 
              className={`font-bold text-sm uppercase tracking-wider transition-colors ${currentPage === 'contact' ? 'text-[#ff5e00]' : 'text-gray-900 hover:text-[#ff5e00]'}`}
            >
              Contact
            </button>
            <button 
              onClick={() => onPageChange('science')} 
              className={`font-bold text-sm uppercase tracking-wider transition-colors ${currentPage === 'science' ? 'text-[#ff5e00]' : 'text-gray-900 hover:text-[#ff5e00]'}`}
            >
              Our Science
            </button>
          </nav>

          {/* Icons & CTA */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-gray-900 hover:text-[#ff5e00] transition-colors p-2">
              <Search className="w-6 h-6" />
            </button>
            <button onClick={onCartToggle} className="text-gray-900 hover:text-[#ff5e00] transition-colors relative p-2">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-[#ff5e00] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center border-2 border-white translate-x-1 -translate-y-1">
                  {totalItems}
                </span>
              )}
            </button>
            <button 
              onClick={() => { onPageChange('home'); setTimeout(() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              className="bg-[#ff5e00] hover:bg-[#e05300] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all shadow-[0_4px_14px_0_rgba(255,94,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,94,0,0.23)] hover:-translate-y-0.5"
            >
              SHOP NOW
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={onCartToggle} className="text-gray-900 hover:text-[#ff5e00] relative p-1">
              <ShoppingCart className="w-7 h-7" />
              {totalItems > 0 && (
                 <span className="absolute -top-1 -right-1 bg-[#ff5e00] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                   {totalItems}
                 </span>
              )}
            </button>
            <button className="text-gray-900 hover:text-[#ff5e00]">
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
