import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate checkout success after 2 seconds
    setTimeout(() => {
        setIsCheckingOut(false);
        clearCart();
        alert('Thank you for your order! This was a simulated checkout.');
        onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#00d2ff] bg-gradient-to-b from-[#00d2ff] to-[#0088ff] z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/20 flex justify-between items-center bg-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-[#ccff00]" />
                <h2 className="font-display font-black text-2xl text-white uppercase tracking-tighter">Your Bag</h2>
                <span className="bg-[#ccff00] text-black text-[10px] font-black px-2 py-0.5 rounded-full">{totalItems} ITEMS</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/60 space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <div>
                    <p className="font-bold text-xl text-white">Your bag is empty</p>
                    <p className="text-sm">Start adding some high-quality supplements!</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="mt-4 px-8 py-3 bg-[#ccff00] text-black font-black rounded-full hover:scale-105 transition-transform"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 group">
                    <div className="w-20 h-20 bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain p-2" />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-white/20" />
                      )}
                    </div>
                    <div className="flex-grow flex flex-col">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight pr-4">{item.title}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[#ccff00] font-black mt-1 text-sm">Ksh {item.price.toLocaleString()}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="flex items-center gap-3 bg-black/20 rounded-full px-2 py-1 border border-white/10">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white hover:bg-white/10"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white hover:bg-white/10"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-white font-black text-sm">Ksh {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Summary */}
            {cart.length > 0 && (
              <div className="p-6 bg-white/10 backdrop-blur-xl border-t border-white/20 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-white/70 text-sm font-medium">
                    <span>Subtotal</span>
                    <span>Ksh {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white/70 text-sm font-medium">
                    <span>Shipping</span>
                    <span className="text-[#ccff00] font-black">FREE</span>
                  </div>
                  <div className="flex justify-between text-white text-xl font-black pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-[#ccff00]">Ksh {totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-[#ccff00] justify-center py-2 bg-black/20 rounded-lg">
                  <ShieldCheck className="w-3 h-3" />
                  Secure Checkout Guaranteed
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-[#ff5e00] hover:bg-[#e05300] disabled:bg-gray-500 text-white py-4 rounded-2xl font-black text-lg tracking-widest transition-all hover:shadow-[0_10px_30px_rgba(255,94,0,0.5)] flex items-center justify-center gap-3 active:scale-95 group"
                >
                  {isCheckingOut ? (
                    <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <span>CHECKOUT NOW</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
