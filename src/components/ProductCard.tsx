import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Package, Eye, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../context/SiteContext';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'new-arrival';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'default' }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  if (variant === 'new-arrival') {
    return (
      <div className="min-w-[260px] w-[260px] bg-white/10 backdrop-blur-lg border border-white/20 rounded-[1.25rem] p-4 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300 hover:border-[#ccff00]">
        <div className="w-full aspect-square bg-white/5 rounded-xl relative flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
            <button className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-[#ccff00] hover:text-black transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-[#ff5e00] hover:border-[#ff5e00] transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>
          {product.image ? (
            <img src={product.image} alt={product.title} className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="flex flex-col items-center text-white/30">
               <Package className="w-8 h-8 mb-2" />
               <span className="text-[10px] uppercase font-bold tracking-wider">No Visual</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 flex-grow">
          <h3 className="font-display font-bold text-[1.1rem] text-white leading-[1.2] line-clamp-2">{product.title}</h3>
          <p className="text-[#ccff00] font-black text-lg mt-1">Ksh {product.price.toLocaleString()}</p>
        </div>
        <button 
          onClick={handleAddToCart}
          className="w-full py-3 rounded-xl bg-white/10 hover:bg-[#ff5e00] text-white font-black text-sm tracking-widest transition-all flex items-center justify-center gap-2 border border-transparent hover:border-white hover:shadow-[0_0_20px_rgba(255,94,0,0.4)]"
        >
          <Plus className="w-4 h-4" /> ADD TO CART
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-[1.25rem] p-[1.25rem] relative transition-all duration-300 flex flex-col gap-4 cursor-pointer hover:-translate-y-[5px] hover:border-[#ccff00] hover:shadow-[0_12px_24px_rgba(0,0,0,0.3)] group text-left">
      
      <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[0.65rem] font-black uppercase bg-[#ccff00] text-black z-10">
        {product.brand}
      </span>

      <div className="w-full aspect-square bg-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.title} className="w-full h-full object-contain p-4 drop-shadow-xl group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex flex-col items-center text-white/30">
             <Package className="w-8 h-8 mb-2" />
             <span className="text-[10px] uppercase font-bold tracking-wider">No Visual</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-display font-bold text-[1.1rem] text-white leading-[1.2]">{product.title}</h3>
        <p className="text-[0.8rem] text-white/60 leading-[1.4] mt-1 line-clamp-1 italic">{product.composition}</p>
      </div>
      
      <div className="mt-auto flex flex-col gap-4 pt-4 border-t border-white/10">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-white/50 text-[10px] font-bold tracking-wider mb-1 uppercase">Total Price</p>
            <p className="text-[#ccff00] font-black text-xl">Ksh {(product.price * quantity).toLocaleString()}</p>
          </div>
          
          <div className="flex items-center space-x-2 bg-black/30 rounded-full p-1 border border-white/10">
            <button 
              onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)); }} 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-white font-bold text-sm w-4 text-center">{quantity}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setQuantity(q => q + 1); }} 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
          className="w-full bg-[#ff5e00] hover:bg-[#e05300] text-white py-3 rounded-xl font-black text-sm tracking-widest transition-all hover:shadow-[0_0_20px_rgba(255,94,0,0.4)] border border-[#ff5e00] hover:border-white flex items-center justify-center space-x-2"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>ADD TO CART</span>
        </button>
      </div>
    </div>
  );
};
