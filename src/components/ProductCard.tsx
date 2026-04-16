import React, { useState } from 'react';
import { ShoppingCart, Package, ChevronDown, ChevronUp, Share2, Heart, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../context/SiteContext';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'new-arrival';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'default' }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const descriptionPreview = product.description
    ? product.description.slice(0, 70) + (product.description.length > 70 ? '...' : '')
    : product.composition
    ? product.composition.slice(0, 70) + (product.composition.length > 70 ? '...' : '')
    : 'A premium health and wellness supplement.';

  if (variant === 'new-arrival') {
    return (
      <div className="min-w-[260px] w-[260px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
        {/* Image */}
        <div className="relative bg-gray-50 aspect-square flex items-center justify-center p-6">
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button className="w-8 h-8 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
              <Heart className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          {product.image ? (
            <img src={product.image} alt={product.title} className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="flex flex-col items-center text-gray-300">
              <Package className="w-12 h-12 mb-2" />
              <span className="text-[10px] uppercase font-bold tracking-wider">No Visual</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3 flex-grow">
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{product.title}</h3>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2 leading-relaxed">{descriptionPreview}</p>
            <p className="text-red-500 font-black text-lg mt-2">Ksh.{product.price.toLocaleString()}.00</p>
          </div>

          <div className="flex gap-2 mt-auto">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-[#15803d] hover:bg-[#14532d] text-white py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              {added ? 'Added!' : 'Add'}
            </button>
            <button
              onClick={() => setShowDetails(v => !v)}
              className="flex-1 border border-gray-200 text-gray-700 hover:border-[#15803d] hover:text-[#15803d] py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              View Details
            </button>
          </div>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  {product.composition && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#14532d] mb-1">Composition</p>
                      <p className="text-xs text-gray-700 font-semibold bg-[#14532d]/5 rounded-lg px-3 py-2">{product.composition}</p>
                    </div>
                  )}
                  {product.description && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Description</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{product.description}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Default card
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Image area */}
      <div className="relative bg-gray-50 aspect-square flex items-center justify-center p-6">
        {/* Brand badge */}
        <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-[0.6rem] font-black uppercase bg-[#15803d] text-white">
          {product.brand}
        </span>

        {/* Action icons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button className="w-8 h-8 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
            <Heart className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center text-gray-400 hover:text-green-500 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center text-gray-300">
            <Package className="w-12 h-12 mb-2" />
            <span className="text-[10px] uppercase font-bold tracking-wider">No Visual</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-grow">
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-tight">{product.title}</h3>
          <p className="text-gray-500 text-sm mt-1.5 leading-relaxed line-clamp-2">{descriptionPreview}</p>
          <p className="text-red-500 font-black text-xl mt-2">Ksh.{product.price.toLocaleString()}.00</p>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)); }}
            className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-200 text-sm font-bold transition-colors"
          >−</button>
          <span className="text-sm font-bold text-gray-900 w-5 text-center">{quantity}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setQuantity(q => q + 1); }}
            className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-200 text-sm font-bold transition-colors"
          >+</button>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-[#15803d] hover:bg-[#14532d] text-white py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            {added ? 'Added!' : 'Add'}
          </button>
          <button
            onClick={() => setShowDetails(v => !v)}
            className="flex-1 border border-gray-200 text-gray-700 hover:border-[#15803d] hover:text-[#15803d] py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1"
          >
            View Details
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Expandable Detail Section */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-gray-100 space-y-3">
                {product.composition && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#14532d] mb-1">Composition</p>
                    <p className="text-xs text-gray-700 font-semibold bg-[#14532d]/5 rounded-lg px-3 py-2">{product.composition}</p>
                  </div>
                )}
                {(product.description || !product.composition) && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Description</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {product.description || 'A premium health and wellness supplement designed to elevate your daily routine.'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
