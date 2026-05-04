import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart, Package, X, Plus, Minus } from 'lucide-react';
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
  const [modalQuantity, setModalQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const handleImgLoad = useCallback(() => setImgLoaded(true), []);
  const handleImgError = useCallback(() => setImgError(true), []);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleModalAddToCart = () => {
    addToCart(product, modalQuantity);
    setModalQuantity(1);
    setIsModalOpen(false);
  };

  const descriptionPreview = product.description
    ? product.description.slice(0, 72) + (product.description.length > 72 ? '...' : '')
    : product.composition
    ? product.composition.slice(0, 72) + (product.composition.length > 72 ? '...' : '')
    : 'A premium health and wellness supplement.';

  // ─── POPUP MODAL ───────────────────────────────────────────────
  const modal = createPortal(
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row max-h-[95vh] md:max-h-[90vh] overflow-y-auto md:overflow-hidden"
          >
            {/* Image (Sticky on mobile) */}
            <div className="w-full md:w-5/12 bg-white/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 h-48 md:h-auto md:max-h-none sticky top-0 z-40 border-b border-gray-100 md:border-b-0 shrink-0">
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-3 md:top-4 md:right-4 z-50 w-9 h-9 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shadow-sm"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>

              {product.image ? (
                <img src={product.image} alt={product.title} className="w-full h-full object-contain drop-shadow-xl" loading="lazy" />
              ) : (
                <div className="flex flex-col items-center text-gray-300">
                  <Package className="w-16 h-16 mb-4" />
                  <span className="text-sm uppercase font-bold tracking-wider">No Visual</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col md:overflow-y-auto shrink-0 z-10 bg-white">
              <span className="inline-block px-3 py-1 bg-[#15803d]/10 text-[#15803d] rounded-full text-[0.65rem] font-black uppercase tracking-widest w-max mb-4">
                {product.brand}
              </span>

              <h2 className="font-display font-bold text-xl md:text-3xl text-gray-900 leading-tight mb-4 md:mb-5">
                {product.title}
              </h2>

              <div className="space-y-4 mb-6 flex-grow">
                {product.composition && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#14532d] mb-1.5">Composition</p>
                    <p className="text-sm text-gray-800 font-semibold bg-[#14532d]/5 border border-[#14532d]/10 rounded-xl px-4 py-3">
                      {product.composition}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {product.description || 'A premium health and wellness supplement designed to elevate your daily routine.'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 mt-auto space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Price</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-red-500 font-black text-2xl md:text-3xl">Ksh.{(product.price * modalQuantity).toLocaleString()}.00</p>
                      {product.originalPrice && (
                        <p className="text-gray-400 line-through text-lg font-bold">Ksh.{(product.originalPrice * modalQuantity).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-100 rounded-full p-1 border border-gray-200">
                    <button
                      onClick={() => setModalQuantity(q => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="font-bold text-gray-900 w-6 text-center">{modalQuantity}</span>
                    <button
                      onClick={() => setModalQuantity(q => q + 1)}
                      className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleModalAddToCart}
                  className="w-full bg-[#15803d] hover:bg-[#14532d] text-white py-4 rounded-2xl font-black text-sm tracking-widest transition-all hover:shadow-xl flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" />
                  ADD TO CART
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );

  // ─── CARD (shared layout) ──────────────────────────────────────
  const cardContent = (
    <div 
      id={`product-${product.id}`} 
      className={`bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer ${variant === 'new-arrival' ? 'min-w-[200px] w-[200px] md:min-w-[260px] md:w-[260px]' : ''}`}
      onClick={() => { setModalQuantity(1); setIsModalOpen(true); }}
    >
      {/* Image area */}
      <div className="relative bg-gray-50 aspect-square flex items-center justify-center p-3 md:p-6">
        {variant === 'default' && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[0.5rem] md:text-[0.6rem] font-black uppercase bg-[#15803d] text-white z-10 truncate max-w-[80%]">
            {product.brand}
          </span>
        )}



        {product.image && !imgError ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-6 rounded-xl bg-gradient-to-br from-[#14532d]/10 to-[#14532d]/5 animate-pulse" />
            )}
            <img
              src={product.image}
              alt={product.title}
              loading="lazy"
              onLoad={handleImgLoad}
              onError={handleImgError}
              className={`w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-all duration-500 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-300">
            <Package className="w-12 h-12 mb-2" />
            <span className="text-[10px] uppercase font-bold tracking-wider">No Visual</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 md:p-4 flex flex-col gap-2 md:gap-3 flex-grow">
        <div>
          <h3 className="font-bold text-gray-900 text-[11px] md:text-base leading-tight line-clamp-2">{product.title}</h3>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2 hidden md:block">{descriptionPreview}</p>
          <div className="flex items-baseline gap-2 mt-1 md:mt-2">
            <p className="text-red-500 font-black text-xs md:text-xl">Ksh.{product.price.toLocaleString()}</p>
            {product.originalPrice && (
              <p className="text-gray-400 line-through text-[10px] md:text-sm font-bold">Ksh.{product.originalPrice.toLocaleString()}</p>
            )}
          </div>
        </div>

        {/* Quantity row */}
        <div className="flex items-center gap-1.5 md:gap-2 mt-auto">
          <button
            onClick={e => { e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)); }}
            className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-200 font-bold transition-colors text-sm"
          >−</button>
          <span className="text-xs md:text-sm font-bold text-gray-900 w-4 text-center">{quantity}</span>
          <button
            onClick={e => { e.stopPropagation(); setQuantity(q => q + 1); }}
            className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-200 font-bold transition-colors text-sm"
          >+</button>
        </div>

        {/* Buttons */}
        <div className="flex gap-1.5 md:gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-[#15803d] hover:bg-[#14532d] text-white py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-1 md:gap-2 shadow-sm active:scale-95"
          >
            <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
            {added ? '✓' : 'Add'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setModalQuantity(1); setIsModalOpen(true); }}
            className="flex-1 border border-gray-200 text-gray-700 hover:border-[#15803d] hover:text-[#15803d] py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {cardContent}
      {modal}
    </>
  );
};
