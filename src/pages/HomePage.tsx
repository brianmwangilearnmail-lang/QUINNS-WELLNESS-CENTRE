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
      <section id="shop-section" className="relative z-20 bg-black/20 backdrop-blur-sm py-24 border-t border-white/10 w-full">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 text-center">
          <div className="mb-16">
            <h2 className="font-display font-black text-5xl md:text-6xl text-white tracking-tighter mb-4">
              SHOP <span className="text-[#ccff00]">PREMIUM</span>
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto font-medium">
              Elevate your daily routine with our scientifically formulated, sustainably sourced supplements.
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 md:gap-8 w-full mx-auto">
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
      <section className="relative z-20 bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-4xl md:text-5xl text-gray-900 tracking-tighter mb-4">
              WHY CHOOSE <span className="text-[#ff5e00]">ABA HEALTH</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-[#ccff00]/20 rounded-full flex items-center justify-center mb-6 text-[#88aa00]">
                <Leaf className="w-10 h-10" />
              </div>
              <h3 className="font-black text-xl mb-3 text-gray-900">Sustainably Sourced</h3>
              <p className="text-gray-600 font-medium">We prioritize the environment by sourcing our ingredients from sustainable, eco-friendly suppliers globally.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-[#ff5e00]/10 rounded-full flex items-center justify-center mb-6 text-[#ff5e00]">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="font-black text-xl mb-3 text-gray-900">Clinically Tested</h3>
              <p className="text-gray-600 font-medium">Every batch undergoes rigorous third-party testing to ensure maximum purity, potency, and safety.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 text-blue-600">
                <Zap className="w-10 h-10" />
              </div>
              <h3 className="font-black text-xl mb-3 text-gray-900">Maximum Absorption</h3>
              <p className="text-gray-600 font-medium">Formulated with advanced delivery systems to ensure your body absorbs the nutrients it needs efficiently.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative z-20 bg-gray-50 py-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <div className="aspect-square bg-gray-200 rounded-3xl overflow-hidden relative shadow-2xl">
              <img src="https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop" alt="Laboratory" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#ff5e00]/40 to-transparent mix-blend-multiply"></div>
            </div>
          </div>
          <div className="md:w-1/2 text-left">
            <h2 className="font-display font-black text-4xl md:text-5xl text-gray-900 tracking-tighter mb-6">
              OUR MISSION
            </h2>
            <p className="text-gray-600 text-lg mb-6 font-medium leading-relaxed">
              At ABA Health, we believe that premium nutrition should be accessible, transparent, and highly effective. Founded by a team of health enthusiasts and clinical researchers, we set out to disrupt the supplement industry by removing fillers and focusing purely on active, bioavailable ingredients.
            </p>
            <p className="text-gray-600 text-lg mb-8 font-medium leading-relaxed">
              Whether you are an elite athlete, a busy professional, or simply looking to optimize your daily wellness, our products are designed to support your unique journey to peak health.
            </p>
            <button className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-full font-bold tracking-widest transition-all hover:-translate-y-1 active:scale-95 shadow-lg">
              READ OUR STORY
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
