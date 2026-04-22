import React, { useMemo } from 'react';
import { Hero } from '../components/Hero';
import { NewArrivalSlider } from '../components/NewArrivalSlider';
import { ProductCard } from '../components/ProductCard';
import { Leaf, ShieldCheck, Zap, Tag, X } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { motion, AnimatePresence } from 'motion/react';

interface HomePageProps {
  activeBrand: string | null;
  onBrandFilter: (brand: string | null) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ activeBrand, onBrandFilter }) => {
  const { products, brands } = useSite();

  const filteredProducts = useMemo(() =>
    activeBrand ? products.filter(p => p.brand === activeBrand) : products,
    [products, activeBrand]
  );

  return (
    <>
      <Hero />
      <NewArrivalSlider />

      {/* Shop Section */}
      <section id="shop-section" className="relative z-20 bg-gray-50 py-12 md:py-24 border-t border-gray-100 w-full">
        <div className="w-full px-3 sm:px-8 md:px-12 lg:px-16 text-center">
          <div className="mb-8 md:mb-12">
            <h2 className="font-display font-black text-3xl md:text-6xl text-gray-900 tracking-tighter mb-3">
              SHOP <span className="text-[#15803d]">PREMIUM</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto font-medium">
              Elevate your daily routine with our scientifically formulated, sustainably sourced supplements.
            </p>
          </div>

          {/* Brand Filter Pills */}
          {brands.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8 md:mb-10">
              <button
                onClick={() => onBrandFilter(null)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
                  !activeBrand
                    ? 'bg-[#14532d] text-white border-[#14532d] shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#14532d] hover:text-[#14532d]'
                }`}
              >
                All Products
              </button>
              {brands.map(brand => (
                <button
                  key={brand.id}
                  onClick={() => onBrandFilter(brand.name)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
                    activeBrand === brand.name
                      ? 'bg-[#14532d] text-white border-[#14532d] shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#14532d] hover:text-[#14532d]'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  {brand.name}
                </button>
              ))}
            </div>
          )}

          {/* Active brand banner */}
          <AnimatePresence>
            {activeBrand && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="inline-flex items-center gap-3 bg-[#14532d]/10 border border-[#14532d]/20 rounded-2xl px-5 py-3 mb-8"
              >
                <Tag className="w-4 h-4 text-[#14532d]" />
                <span className="text-sm font-black text-[#14532d] uppercase tracking-wider">
                  Showing: {activeBrand}
                </span>
                <button
                  onClick={() => onBrandFilter(null)}
                  className="w-5 h-5 rounded-full bg-[#14532d]/20 hover:bg-[#14532d]/40 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-[#14532d]" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 md:gap-8 w-full mx-auto">
            {products.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="w-12 h-12 border-4 border-[#15803d] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#15803d] font-bold tracking-widest uppercase">Loading Products...</p>
              </div>
            )}
            {products.length > 0 && filteredProducts.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center gap-4">
                <Tag className="w-12 h-12 text-gray-200" />
                <p className="text-gray-400 font-bold tracking-widest uppercase">No products under "{activeBrand}"</p>
                <button onClick={() => onBrandFilter(null)} className="text-[#14532d] font-black text-sm underline uppercase tracking-wider">
                  View All Products
                </button>
              </div>
            )}
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-20 bg-white py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-display font-black text-2xl md:text-5xl text-gray-900 tracking-tighter mb-4">
              WHY CHOOSE <span className="text-[#14532d]">QUINS WELLNESS</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#15803d]/10 rounded-full flex items-center justify-center mb-4 md:mb-6 text-[#15803d]">
                <Leaf className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <h3 className="font-black text-lg md:text-xl mb-2 md:mb-3 text-gray-900">Sustainably Sourced</h3>
              <p className="text-gray-600 font-medium text-sm md:text-base">We prioritize the environment by sourcing our ingredients from sustainable, eco-friendly suppliers globally.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#14532d]/10 rounded-full flex items-center justify-center mb-4 md:mb-6 text-[#14532d]">
                <ShieldCheck className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <h3 className="font-black text-lg md:text-xl mb-2 md:mb-3 text-gray-900">Clinically Tested</h3>
              <p className="text-gray-600 font-medium text-sm md:text-base">Every batch undergoes rigorous third-party testing to ensure maximum purity, potency, and safety.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 md:mb-6 text-blue-600">
                <Zap className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <h3 className="font-black text-lg md:text-xl mb-2 md:mb-3 text-gray-900">Maximum Absorption</h3>
              <p className="text-gray-600 font-medium text-sm md:text-base">Formulated with advanced delivery systems to ensure your body absorbs the nutrients it needs efficiently.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative z-20 bg-gray-50 py-12 md:py-24 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="w-full">
            <h2 className="font-display font-black text-2xl md:text-5xl text-gray-900 tracking-tighter mb-4 md:mb-6">
              OUR MISSION
            </h2>
            <p className="text-gray-600 text-sm md:text-lg mb-4 md:mb-6 font-medium leading-relaxed">
              At Quins Wellness Centre, we believe that premium nutrition should be accessible, transparent, and highly effective. Founded by a team of health enthusiasts and clinical researchers, we set out to disrupt the supplement industry by removing fillers and focusing purely on active, bioavailable ingredients.
            </p>
            <p className="text-gray-600 text-sm md:text-lg mb-6 md:mb-8 font-medium leading-relaxed">
              Whether you are an elite athlete, a busy professional, or simply looking to optimize your daily wellness, our products are designed to support your unique journey to peak health.
            </p>
            <button className="bg-gray-900 hover:bg-black text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold tracking-widest transition-all hover:-translate-y-1 active:scale-95 shadow-lg text-sm md:text-base">
              READ OUR STORY
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
