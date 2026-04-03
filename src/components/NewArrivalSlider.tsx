import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useSite } from '../context/SiteContext';

export const NewArrivalSlider: React.FC = () => {
  const { products } = useSite();
  // For demonstration, taking the last 8 items as "new arrivals"
  const newArrivals = products.slice(-8).reverse();

  return (
    <section className="relative z-20 bg-black/30 backdrop-blur-md py-16 border-t border-white/10 w-full">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
          <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-tighter">
            NEW TO <span className="text-[#ccff00]">ABA HEALTH</span>
          </h2>
          <a href="#shop-section" className="text-[#ff5e00] hover:text-white font-bold flex items-center gap-2 transition-colors text-sm md:text-base uppercase tracking-wider">
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
