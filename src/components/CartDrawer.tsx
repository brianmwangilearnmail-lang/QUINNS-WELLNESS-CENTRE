import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, User, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSite } from '../context/SiteContext';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { createOrder } = useSite();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'form'>('cart');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleClose = () => {
    setIsSuccess(false);
    setCheckoutStep('cart');
    setOrderError(null);
    onClose();
  };

  const handleConfirmOrder = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setOrderError('Please enter your name and email address.');
      return;
    }

    setOrderError(null);
    setIsCheckingOut(true);

    const orderItems = cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price_at_sale: item.price,
    }));

    try {
      const result = await createOrder(
        {
          customer_name: formData.name.trim(),
          customer_email: formData.email.trim(),
          total_amount: totalPrice,
          status: 'pending',
        },
        orderItems
      );

      if (result.success) {
        setIsSuccess(true);
        clearCart();
        setFormData({ name: '', email: '' });
      } else {
        setOrderError(result.error || 'An unexpected error occurred. Please try again.');
      }
    } catch (err: any) {
      setOrderError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            {isSuccess ? (
              /* ========== SUCCESS STATE ========== */
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white space-y-6">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-24 h-24 bg-[#15803d]/10 rounded-full flex items-center justify-center text-[#14532d]"
                >
                  <ShieldCheck className="w-12 h-12" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="font-display font-black text-4xl text-gray-900 uppercase tracking-tighter leading-none">Order Placed!</h2>
                  <p className="text-gray-500 font-medium text-sm">Thank you for starting your wellness journey with Quins Centre.</p>
                </div>
                <div className="w-full h-px bg-gray-100" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                  Your order has been received. Our team will prepare and dispatch it shortly.
                </p>
                <button
                  onClick={handleClose}
                  className="w-full bg-[#14532d] text-white py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-[#114022] transition-colors uppercase mt-8 shadow-lg shadow-green-900/10"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {/* ========== HEADER ========== */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm flex-shrink-0">
                  <div className="flex items-center gap-3">
                    {checkoutStep === 'form' && (
                      <button
                        onClick={() => { setCheckoutStep('cart'); setOrderError(null); }}
                        className="mr-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                      </button>
                    )}
                    <ShoppingBag className="w-6 h-6 text-[#15803d]" />
                    <h2 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tighter">
                      {checkoutStep === 'cart' ? 'Your Bag' : 'Checkout'}
                    </h2>
                    {checkoutStep === 'cart' && (
                      <span className="bg-[#15803d] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{totalItems} ITEMS</span>
                    )}
                  </div>
                  <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* ========== CONTENT ========== */}
                <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {checkoutStep === 'cart' ? (
                    cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4 pt-20">
                        <ShoppingBag className="w-16 h-16 opacity-20" />
                        <div>
                          <p className="font-bold text-xl text-gray-900">Your bag is empty</p>
                          <p className="text-sm">Start adding some high-quality supplements!</p>
                        </div>
                        <button
                          onClick={onClose}
                          className="mt-4 px-8 py-3 bg-[#15803d] text-white font-black rounded-full hover:scale-105 transition-transform"
                        >
                          CONTINUE SHOPPING
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 group">
                            <div className="w-20 h-20 bg-white rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                              {item.image ? (
                                <img src={item.image} alt={item.title} className="w-full h-full object-contain p-2" />
                              ) : (
                                <ShoppingBag className="w-8 h-8 text-gray-200" />
                              )}
                            </div>
                            <div className="flex-grow flex flex-col">
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight pr-4">{item.title}</h3>
                                <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-[#15803d] font-black mt-1 text-sm">Ksh {item.price.toLocaleString()}</p>
                              <div className="flex items-center justify-between mt-auto pt-2">
                                <div className="flex items-center gap-3 bg-white rounded-full px-2 py-1 border border-gray-200 shadow-sm">
                                  <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100">
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-bold text-gray-900 w-4 text-center">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100">
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="text-gray-900 font-black text-sm">Ksh {(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    /* ========== FORM STEP ========== */
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Personal Information</h3>
                        <div className="space-y-3">
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#15803d] transition-colors">
                              <User className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              placeholder="Full Name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#15803d] transition-all"
                            />
                          </div>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#15803d] transition-colors">
                              <Mail className="w-4 h-4" />
                            </div>
                            <input
                              type="email"
                              placeholder="Email Address"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#15803d] transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-[#15803d]/5 rounded-2xl border border-[#15803d]/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#15803d]">Order Summary</span>
                          <span className="text-[10px] font-black text-[#15803d]">{totalItems} Items</span>
                        </div>
                        <div className="space-y-1">
                          {cart.map(item => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span className="text-gray-600 truncate mr-4">{item.quantity}x {item.title}</span>
                              <span className="font-bold text-gray-900">Ksh {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Section */}
                      <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
                        <div>
                          <h3 className="text-sm font-black text-gray-900">Payment</h3>
                          <p className="text-[11px] text-gray-400 font-medium">All transactions are secure and encrypted.</p>
                        </div>

                        {/* COD Option */}
                        <div className="flex items-center gap-3 p-3 border-2 border-[#15803d] rounded-xl bg-[#15803d]/5">
                          <div className="w-5 h-5 rounded-full bg-[#15803d] flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                          <span className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</span>
                        </div>

                        {/* Policy Details */}
                        <div className="space-y-2 text-[12px] text-gray-700 leading-relaxed pt-1">
                          <p>
                            We <span className="font-black">ONLY</span> accept <span className="font-black">Cash or M-pesa on delivery IF</span>:
                          </p>

                          <p>
                            1. Within <span className="font-bold">Nairobi Metropolis</span>.
                          </p>

                          <p>
                            2. Cash on Delivery also if you are picking your order <span className="font-bold">at our PickUp-Shop in Nairobi CBD</span>, at <span className="font-bold">Nyota building</span>, <span className="font-bold">Accra road</span>, 2nd floor, Room 201.
                          </p>

                          <p>
                            If you are outside Nairobi CBD, you will as well kindly cater between (<span className="font-bold">Sh.100 – sh.400</span>) for delivery
                          </p>

                          <div className="pt-1 border-t border-gray-100 space-y-1">
                            <p className="font-bold text-gray-500 uppercase text-[10px] tracking-widest">NB:</p>
                            <p>
                              1. We do <span className="font-black">FREE delivery</span> for orders worth <span className="font-black">ksh.3000 <em>and above</em></span>.
                            </p>
                          </div>
                        </div>
                      </div>

                      {orderError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                          {orderError}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ========== FOOTER ========== */}
                {cart.length > 0 && (
                  <div className="p-6 bg-white border-t border-gray-200 shadow-2xl space-y-4 flex-shrink-0">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-500 text-sm font-medium">
                        <span>Subtotal</span>
                        <span>Ksh {totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-sm font-medium">
                        <span>Shipping</span>
                        <span className="text-[#14532d] font-black">FREE</span>
                      </div>
                      <div className="flex justify-between text-gray-900 text-xl font-black pt-2 border-t border-gray-100">
                        <span>Total</span>
                        <span className="text-[#14532d]">Ksh {totalPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-gray-400 justify-center py-2 bg-gray-50 rounded-lg border border-gray-100">
                      <ShieldCheck className="w-3 h-3 text-[#15803d]" />
                      Secure Checkout Guaranteed
                    </div>

                    {checkoutStep === 'cart' ? (
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('form')}
                        className="w-full bg-[#14532d] hover:bg-[#114022] text-white py-4 rounded-2xl font-black text-lg tracking-widest transition-all hover:shadow-[0_10px_30px_rgba(20,83,45,0.5)] flex items-center justify-center gap-3 active:scale-95 group"
                      >
                        <span>CHECKOUT NOW</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConfirmOrder}
                        disabled={isCheckingOut}
                        className="w-full bg-[#14532d] hover:bg-[#114022] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-lg tracking-widest transition-all hover:shadow-[0_10px_30px_rgba(20,83,45,0.5)] flex items-center justify-center gap-3 active:scale-95 group"
                      >
                        {isCheckingOut ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>PLACING ORDER...</span>
                          </>
                        ) : (
                          <>
                            <span>CONFIRM ORDER</span>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
