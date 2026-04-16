import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart, Plus, Minus, Package, Eye, Heart, X } from 'lucide-react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup if component unmounts
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  const handleModalAddToCart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart(product, modalQuantity);
    setModalQuantity(1);
    setIsModalOpen(false);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsModalOpen(false);
  };

  const modalContent = createPortal(
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
          {/* Backdrop */}
          <motion.div 
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div 
            key="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()} 
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shadow-sm"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Image Section */}
            <div className="w-full md:w-1/2 min-h-[300px] bg-gray-50 flex items-center justify-center p-8 relative">
              {product.image ? (
                <img src={product.image} alt={product.title} className="w-full h-full object-contain drop-shadow-2xl" />
              ) : (
                <div className="flex flex-col items-center text-gray-300">
                   <Package className="w-16 h-16 mb-4" />
                   <span className="text-sm uppercase font-bold tracking-wider">No Visual</span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto">
              <span className="inline-block px-3 py-1 bg-[#15803d]/10 text-[#15803d] rounded-full text-[0.65rem] font-black uppercase tracking-widest w-max mb-6">
                {product.brand}
              </span>

              <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 leading-tight mb-4">
                {product.title}
              </h2>
              
              <div className="space-y-6 mb-8">
                {product.composition && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#14532d] mb-2">Composition</h3>
                    <p className="text-gray-900 font-bold bg-[#14532d]/5 border border-[#14532d]/10 rounded-xl px-4 py-3 inline-block text-sm">
                      {product.composition}
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Description</h3>
                  <div className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap">
                    {product.description || "A premium health and wellness supplement designed to elevate your daily routine."}
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-6 pt-8 border-t border-gray-100">
                 <div className="flex justify-between items-end">
                    <div>
                      <p className="text-gray-400 text-xs font-bold tracking-wider mb-1 uppercase">Total Price</p>
                      <p className="text-[#15803d] font-black text-4xl">Ksh {(product.price * modalQuantity).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-gray-100 rounded-full p-1.5 border border-gray-200">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setModalQuantity(q => Math.max(1, q - 1)); }} 
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-gray-900 font-bold text-lg w-8 text-center">{modalQuantity}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setModalQuantity(q => q + 1); }} 
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                 </div>

                 <button 
                    onClick={handleModalAddToCart}
                    className="w-full bg-[#14532d] hover:bg-[#114022] text-white py-4 rounded-xl font-black text-base tracking-widest transition-all hover:shadow-xl hover:-translate-y-1 border border-[#14532d] flex items-center justify-center space-x-3"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>ADD TO CART</span>
                  </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );

  if (variant === 'new-arrival') {
    return (
      <>
        <div 
          onClick={openModal}
          className="min-w-[260px] w-[260px] cursor-pointer bg-white border border-gray-200 rounded-[1.25rem] p-4 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300 hover:border-[#14532d] shadow-sm hover:shadow-xl"
        >
          <div className="w-full aspect-square bg-white/5 rounded-xl relative flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute top-2 right-2 flex flex-col gap-2 z-10" onClick={e => e.stopPropagation()}>
              <button 
                onClick={openModal}
                className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#15803d] hover:text-white transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#14532d] hover:text-white hover:border-[#14532d] transition-colors"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
            {product.image ? (
              <img src={product.image} alt={product.title} className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="flex flex-col items-center text-gray-300">
                 <Package className="w-8 h-8 mb-2" />
                 <span className="text-[10px] uppercase font-bold tracking-wider">No Visual</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 flex-grow">
            <h3 className="font-display font-bold text-[1.1rem] text-gray-900 leading-[1.2] line-clamp-2">{product.title}</h3>
            <p className="text-[#15803d] font-black text-lg mt-1">Ksh {product.price.toLocaleString()}</p>
          </div>
          <button 
            onClick={handleAddToCart}
            className="w-full py-3 rounded-xl bg-gray-100 hover:bg-[#14532d] text-gray-900 hover:text-white font-black text-sm tracking-widest transition-all flex items-center justify-center gap-2 border border-transparent hover:shadow-[0_0_20px_rgba(255,94,0,0.4)]"
          >
            <Plus className="w-4 h-4" /> ADD TO CART
          </button>
        </div>
        {modalContent}
      </>
    );
  }

  return (
    <>
      <div 
        onClick={openModal}
        className="bg-white border border-gray-200 rounded-[1.25rem] p-[1.25rem] relative transition-all duration-300 flex flex-col gap-4 cursor-pointer hover:-translate-y-[5px] hover:border-[#14532d] shadow-sm hover:shadow-2xl group text-left"
      >
        
        <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[0.65rem] font-black uppercase bg-[#15803d] text-white z-10">
          {product.brand}
        </span>

        <div className="w-full aspect-square bg-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.title} className="w-full h-full object-contain p-4 drop-shadow-xl group-hover:scale-105 transition-transform duration-500" />
          ) : (
             <div className="flex flex-col items-center text-gray-300">
               <Package className="w-8 h-8 mb-2" />
               <span className="text-[10px] uppercase font-bold tracking-wider">No Visual</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-display font-bold text-[1.1rem] text-gray-900 leading-[1.2]">{product.title}</h3>
          <p className="text-[0.8rem] text-gray-500 leading-[1.4] mt-1 line-clamp-1 italic">{product.composition || product.description}</p>
        </div>
        
        <div className="mt-auto flex flex-col gap-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-gray-400 text-[10px] font-bold tracking-wider mb-1 uppercase">Total Price</p>
              <p className="text-[#15803d] font-black text-xl">Ksh {(product.price * quantity).toLocaleString()}</p>
            </div>
            
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1 border border-gray-200">
              <button 
                onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)); }} 
                className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors shadow-sm"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-gray-900 font-bold text-sm w-4 text-center">{quantity}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setQuantity(q => q + 1); }} 
                className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors shadow-sm"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
            className="w-full bg-[#14532d] hover:bg-[#114022] text-white py-3 rounded-xl font-black text-sm tracking-widest transition-all hover:shadow-lg border border-[#14532d] flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>ADD TO CART</span>
          </button>
        </div>
      </div>
      {modalContent}
    </>
  );
};
