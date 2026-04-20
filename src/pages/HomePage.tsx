import React from 'react';
import { Hero } from '../components/Hero';
import { NewArrivalSlider } from '../components/NewArrivalSlider';
import { ProductCard } from '../components/ProductCard';
import { Leaf, ShieldCheck, Zap } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export const HomePage: React.FC = () => {
  const { products } = useSite();

  return (
    <>
      <Hero />
      <NewArrivalSlider />

      {/* Shop Section */}
      <section id="shop-section" className="relative z-20 bg-gray-50 py-12 md:py-24 border-t border-gray-100 w-full">
        <div className="w-full px-3 sm:px-8 md:px-12 lg:px-16 text-center">
          <div className="mb-8 md:mb-16">
            <h2 className="font-display font-black text-3xl md:text-6xl text-gray-900 tracking-tighter mb-3">
              SHOP <span className="text-[#15803d]">PREMIUM</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto font-medium">
              Elevate your daily routine with our scientifically formulated, sustainably sourced supplements.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 md:gap-8 w-full mx-auto">
            {products.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="w-12 h-12 border-4 border-[#15803d] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#15803d] font-bold tracking-widest uppercase">Loading Products...</p>
              </div>
            )}
            {products.map((product) => (
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="w-full md:w-1/2">
            <div className="aspect-square bg-gray-200 rounded-3xl overflow-hidden relative shadow-2xl">
              <img src="https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop" alt="Laboratory" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#14532d]/40 to-transparent mix-blend-multiply"></div>
            </div>
          </div>
          <div className="w-full md:w-1/2 text-left">
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
