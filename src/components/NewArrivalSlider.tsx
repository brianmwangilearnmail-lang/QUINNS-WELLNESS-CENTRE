import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useSite } from '../context/SiteContext';

export const NewArrivalSlider: React.FC = () => {
  const { products } = useSite();
  // For demonstration, taking the last 8 items as "new arrivals"
  const newArrivals = products.slice(-8).reverse();

  return (
    <section className="relative z-20 bg-gray-100 py-16 border-t border-gray-200 w-full">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <h2 className="font-display font-black text-xl md:text-4xl text-gray-900 tracking-tighter">
            NEW TO <span className="text-[#14532d]">QUINS WELLNESS</span>
          </h2>
          <a href="#shop-section" className="text-[#14532d] hover:text-white font-bold flex items-center gap-2 transition-colors text-sm md:text-base uppercase tracking-wider">
            View All <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </a>
        </div>
        
        <div className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory custom-scrollbar">
          {newArrivals.map((product) => (
            <div key={`new-${product.id}`} className="snap-start shrink-0">
              <ProductCard product={product} variant="new-arrival" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
