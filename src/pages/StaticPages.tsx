import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popup, setPopup] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { error } = await supabase.from('contact_messages').insert([{
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    }]);

    setIsSubmitting(false);

    if (error) {
      console.error('Error submitting form:', error);
      setPopup({ show: true, type: 'error', message: 'Failed to send message. Please try again later.' });
    } else {
      setPopup({ show: true, type: 'success', message: 'Message details sent successfully. We will get back to you shortly!' });
      setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="relative z-20 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-gray-900">
      <div className="text-center mb-10 md:mb-16">
        <h1 className="font-display font-black text-4xl md:text-7xl tracking-tighter mb-4 md:mb-6 uppercase">
          GET IN <span className="text-[#14532d]">TOUCH</span>
        </h1>
        <p className="text-base md:text-xl text-gray-600 font-medium max-w-2xl mx-auto mb-4">
          Have questions about our products or your order? We're here to help.
        </p>
        <div className="flex flex-col items-center gap-2 text-lg font-bold text-[#15803d]">
          <a href="mailto:kequins09@gmail.com" className="hover:text-gray-900 transition-colors">kequins09@gmail.com</a>
          <a href="tel:+254714279143" className="hover:text-gray-900 transition-colors">+254 714 279143</a>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-12 shadow-xl">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-wider uppercase text-gray-500">First Name</label>
              <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors" placeholder="John" required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-wider uppercase text-gray-500">Last Name</label>
              <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors" placeholder="Doe" required disabled={isSubmitting} />
            </div>
          </div>
          
          <div className="space-y-2 text-left">
            <label className="text-sm font-bold tracking-wider uppercase text-gray-500">Email Address</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors" placeholder="john@example.com" required disabled={isSubmitting} />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm font-bold tracking-wider uppercase text-gray-500">Subject</label>
            <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors appearance-none" required disabled={isSubmitting}>
              <option value="" className="text-black">Select a topic...</option>
              <option value="order" className="text-black">Order Inquiry</option>
              <option value="product" className="text-black">Product Question</option>
              <option value="wholesale" className="text-black">Wholesale</option>
              <option value="other" className="text-black">Other</option>
            </select>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm font-bold tracking-wider uppercase text-gray-500">Message</label>
            <textarea rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors resize-none" placeholder="How can we help you?" required disabled={isSubmitting}></textarea>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-[#15803d] hover:bg-[#114022] text-white py-4 rounded-xl font-black text-lg tracking-widest transition-all hover:shadow-[0_0_20px_rgba(21,128,61,0.4)] mt-4 active:scale-95 disabled:opacity-75">
            {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {popup.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setPopup({ ...popup, show: false })}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center"
            >
              {popup.type === 'success' ? (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              )}
              
              <h3 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tighter mb-4">
                {popup.type === 'success' ? 'Success!' : 'Error'}
              </h3>
              
              <p className="text-gray-600 font-medium mb-8 leading-relaxed">
                {popup.message}
              </p>

              <button 
                onClick={() => setPopup({ ...popup, show: false })}
                className={`w-full py-4 rounded-xl font-black text-lg tracking-widest transition-all text-white active:scale-95 shadow-lg ${
                  popup.type === 'success' 
                    ? 'bg-[#15803d] hover:bg-[#114022] hover:shadow-[0_10px_30px_rgba(21,128,61,0.4)]' 
                    : 'bg-red-500 hover:bg-red-600 hover:shadow-[0_10px_30px_rgba(239,68,68,0.4)]'
                }`}
              >
                GOT IT
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SciencePage: React.FC = () => {
    return (
      <div className="relative z-20 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-gray-900">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="font-display font-black text-4xl md:text-7xl tracking-tighter mb-4 md:mb-6 uppercase">
            OUR <span className="text-[#16a34a]">SCIENCE</span>
          </h1>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
            At Quins Wellness Centre, we don't guess. We test. Our formulations are built on clinical research and rigorous scientific validation.
          </p>
        </div>
  
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24 text-left">
          <div className="relative aspect-square rounded-3xl overflow-hidden border border-gray-200 shadow-xl">
            <img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop" alt="Microscope" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-xl">
            <h2 className="font-display font-bold text-3xl mb-6 text-[#16a34a]">Evidence-Based Formulation</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Every ingredient we select is backed by peer-reviewed clinical trials. We use the exact dosages proven to be effective in human studies, never hiding behind "proprietary blends."
            </p>
            <ul className="space-y-4 text-gray-600 font-medium">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-[#15803d] shrink-0" />
                <span>Third-party tested for heavy metals, microbes, and allergens.</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-[#15803d] shrink-0" />
                <span>Bioavailable forms of vitamins (e.g., Methylcobalamin instead of Cyanocobalamin).</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-[#15803d] shrink-0" />
                <span>Manufactured in cGMP certified facilities.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
};

export const PrivacyPage: React.FC = () => {
    return (
      <div className="relative z-20 py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-gray-900">
        <div className="mb-12 text-left">
          <h1 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-6 uppercase">
            PRIVACY <span className="text-[#14532d]">POLICY</span>
          </h1>
          <p className="text-gray-500">Last updated: April 2026</p>
        </div>
  
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 space-y-8 text-gray-600 leading-relaxed text-left shadow-xl">
          <section>
            <h2 className="font-bold text-2xl text-gray-900 mb-4 uppercase tracking-tighter">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, make a purchase, or contact us for support. This may include your name, email address, shipping address, and payment information.</p>
          </section>
          
          <section>
            <h2 className="font-bold text-2xl text-gray-900 mb-4 uppercase tracking-tighter">2. How We Use Your Information</h2>
            <p>We use the information we collect to process your orders, communicate with you about your purchases, and improve our website and product offerings. We do not sell your personal data to third parties.</p>
          </section>
  
          <section>
            <h2 className="font-bold text-2xl text-gray-900 mb-4 uppercase tracking-tighter">3. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information during transmission and storage. All payment processing is handled by secure, PCI-compliant third-party processors.</p>
          </section>
        </div>
      </div>
    );
};
