import React from 'react';
import { Leaf, ShieldCheck, Zap } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="relative z-20 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white">
      <div className="text-center mb-16">
        <h1 className="font-display font-black text-5xl md:text-7xl tracking-tighter mb-6 uppercase">
          ABOUT <span className="text-[#ccff00]">ABA HEALTH</span>
        </h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto font-medium leading-relaxed">
          We are dedicated to providing premium, scientifically-backed supplements to help you achieve your peak physical and mental performance.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-24 text-left">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h2 className="font-display font-bold text-3xl mb-6 text-[#ccff00]">Our Story</h2>
          <p className="text-white/80 leading-relaxed mb-6">
            Founded with a passion for holistic well-being, ABA HEALTH started as a small initiative to bring transparent, high-quality nutrition to our community. We noticed a gap in the market for supplements that were both effective and sustainably sourced.
          </p>
          <p className="text-white/80 leading-relaxed">
            Today, we partner with top researchers and sustainable farms globally to ensure every product we offer meets the highest standards of purity and potency.
          </p>
        </div>
        <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
          <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop" alt="Laboratory" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 text-center">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
          <div className="w-16 h-16 bg-[#ff5e00] rounded-full flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-xl mb-4">Pure Ingredients</h3>
          <p className="text-white/70 text-sm">We source only the finest raw materials, ensuring no artificial fillers or harmful additives.</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
          <div className="w-16 h-16 bg-[#ccff00] rounded-full flex items-center justify-center mx-auto mb-6 text-black">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-xl mb-4">Rigorous Testing</h3>
          <p className="text-white/70 text-sm">Every batch undergoes strict third-party testing for quality, safety, and efficacy.</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
          <div className="w-16 h-16 bg-[#00d2ff] rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-xl mb-4">Maximum Efficacy</h3>
          <p className="text-white/70 text-sm">Formulated for optimal absorption so your body gets exactly what it needs.</p>
        </div>
      </div>
    </div>
  );
};
