import React, { useRef } from 'react';
import { Upload, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useSite } from '../context/SiteContext';

export const Hero: React.FC = () => {
  const { hero, updateHero } = useSite();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      updateHero({ mainImage: base64 });
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 min-h-[90vh]">
      
      {/* Background Typography */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
        <motion.h1 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-black text-[18vw] md:text-[15vw] leading-[0.8] text-[#15803d] text-center tracking-tighter drop-shadow-xl whitespace-nowrap"
        >
          {hero.titleTop}
        </motion.h1>
        <motion.h1 
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="font-display font-black text-[16vw] md:text-[14vw] leading-[0.9] text-outline text-center tracking-tighter whitespace-nowrap"
        >
          {hero.titleBottom}
        </motion.h1>
      </div>

      {/* Hero Subtitle - positioned below title, above product */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative z-30 mt-4 md:mt-8 mb-2 text-gray-800 font-semibold text-base md:text-lg text-center max-w-xl mx-auto px-4"
      >
        {hero.subtitle}
      </motion.p>

      {/* Product Image */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="relative z-20 flex justify-center items-center h-[40vh] md:h-[60vh] mt-4 md:mt-8 cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="h-full relative z-10 flex items-center justify-center"
        >
          {hero.mainImage ? (
            <img 
              src={hero.mainImage} 
              alt="Quins Wellness Centre Premium Supplement" 
              className="h-full object-contain drop-shadow-[0_40px_40px_rgba(0,0,0,0.4)]"
            />
          ) : (
            <div className="h-[40vh] md:h-[50vh] aspect-[3/4] bg-gray-100 backdrop-blur-md border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center p-8 text-gray-500 text-center hover:bg-gray-200 transition-all shadow-xl group-hover:scale-105 group-hover:border-[#15803d]">
              <Upload className="w-16 h-16 mb-4 text-[#15803d] group-hover:scale-110 transition-transform" />
              <p className="font-black text-2xl mb-2 tracking-tight">CLICK TO UPLOAD</p>
              <p className="text-sm font-medium opacity-90">Upload your Salmon Oil image here!</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.7 }}
        className="relative z-30 mt-8 md:mt-12 mb-8"
      >
        <button 
          onClick={() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-[#14532d] hover:bg-[#114022] text-white px-12 py-5 rounded-full font-black text-xl tracking-widest transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,94,0,0.6)] border-2 border-[#14532d] hover:border-white flex items-center space-x-3 active:scale-95"
        >
          <span>VIEW SUPPLEMENTS</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </motion.div>

    </main>
  );
};
