import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="relative z-20 py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-white">
      <div className="text-center mb-16">
        <h1 className="font-display font-black text-5xl md:text-7xl tracking-tighter mb-6 uppercase">
          GET IN <span className="text-[#ff5e00]">TOUCH</span>
        </h1>
        <p className="text-xl text-white/80 font-medium">
          Have questions about our products or your order? We're here to help.
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Message sent! This is a simulation."); }}>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-wider uppercase text-white/80">First Name</label>
              <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors" placeholder="John" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-wider uppercase text-white/80">Last Name</label>
              <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors" placeholder="Doe" required />
            </div>
          </div>
          
          <div className="space-y-2 text-left">
            <label className="text-sm font-bold tracking-wider uppercase text-white/80">Email Address</label>
            <input type="email" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors" placeholder="john@example.com" required />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm font-bold tracking-wider uppercase text-white/80">Subject</label>
            <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors appearance-none" required>
              <option value="" className="text-black">Select a topic...</option>
              <option value="order" className="text-black">Order Inquiry</option>
              <option value="product" className="text-black">Product Question</option>
              <option value="wholesale" className="text-black">Wholesale</option>
              <option value="other" className="text-black">Other</option>
            </select>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm font-bold tracking-wider uppercase text-white/80">Message</label>
            <textarea rows={5} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors resize-none" placeholder="How can we help you?" required></textarea>
          </div>

          <button type="submit" className="w-full bg-[#ccff00] hover:bg-[#b3e600] text-black py-4 rounded-xl font-black text-lg tracking-widest transition-all hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] mt-4 active:scale-95">
            SEND MESSAGE
          </button>
        </form>
      </div>
    </div>
  );
};

export const SciencePage: React.FC = () => {
    return (
      <div className="relative z-20 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white">
        <div className="text-center mb-16">
          <h1 className="font-display font-black text-5xl md:text-7xl tracking-tighter mb-6 uppercase">
            OUR <span className="text-[#00d2ff]">SCIENCE</span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto font-medium leading-relaxed">
            At ABA Health, we don't guess. We test. Our formulations are built on clinical research and rigorous scientific validation.
          </p>
        </div>
  
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24 text-left">
          <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
            <img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop" alt="Microscope" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h2 className="font-display font-bold text-3xl mb-6 text-[#00d2ff]">Evidence-Based Formulation</h2>
            <p className="text-white/80 leading-relaxed mb-6">
              Every ingredient we select is backed by peer-reviewed clinical trials. We use the exact dosages proven to be effective in human studies, never hiding behind "proprietary blends."
            </p>
            <ul className="space-y-4 text-white/80 font-medium">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-[#ccff00] shrink-0" />
                <span>Third-party tested for heavy metals, microbes, and allergens.</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-[#ccff00] shrink-0" />
                <span>Bioavailable forms of vitamins (e.g., Methylcobalamin instead of Cyanocobalamin).</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-[#ccff00] shrink-0" />
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
      <div className="relative z-20 py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-white">
        <div className="mb-12 text-left">
          <h1 className="font-display font-black text-4xl md:text-5xl tracking-tighter mb-6 uppercase">
            PRIVACY <span className="text-[#ff5e00]">POLICY</span>
          </h1>
          <p className="text-white/60">Last updated: April 2026</p>
        </div>
  
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 space-y-8 text-white/80 leading-relaxed text-left shadow-xl">
          <section>
            <h2 className="font-bold text-2xl text-white mb-4 uppercase tracking-tighter">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, make a purchase, or contact us for support. This may include your name, email address, shipping address, and payment information.</p>
          </section>
          
          <section>
            <h2 className="font-bold text-2xl text-white mb-4 uppercase tracking-tighter">2. How We Use Your Information</h2>
            <p>We use the information we collect to process your orders, communicate with you about your purchases, and improve our website and product offerings. We do not sell your personal data to third parties.</p>
          </section>
  
          <section>
            <h2 className="font-bold text-2xl text-white mb-4 uppercase tracking-tighter">3. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information during transmission and storage. All payment processing is handled by secure, PCI-compliant third-party processors.</p>
          </section>
        </div>
      </div>
    );
};
