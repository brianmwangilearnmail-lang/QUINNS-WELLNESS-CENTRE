import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Lock, User } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginPageProps {
  onLogin: () => void;
  onBack: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    // Controlled credentials: ABA_HEALTH / ABAHEALTH@123#
    setTimeout(() => {
      if (username === 'ABA_HEALTH' && password === 'ABAHEALTH@123#') {
        onLogin();
      } else {
        setError('Invalid username or password. Please try again.');
        setIsLoggingIn(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative z-20">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ccff00]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#ff5e00]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#ff5e00] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(255,94,0,0.4)]">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-black text-3xl text-white uppercase tracking-tighter">Admin Portal</h1>
          <p className="text-white/60 text-sm mt-2 font-medium">Authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ccff00] ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-white focus:outline-none focus:border-[#ccff00] transition-colors font-medium placeholder:text-white/20" 
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ccff00] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-white focus:outline-none focus:border-[#ccff00] transition-colors font-medium placeholder:text-white/20" 
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit" 
            disabled={isLoggingIn}
            className="w-full bg-[#ccff00] hover:bg-[#b3e600] disabled:bg-gray-500 text-black py-4 rounded-xl font-black text-lg tracking-widest transition-all hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] mt-4 active:scale-95 flex items-center justify-center gap-3 group"
          >
            {isLoggingIn ? (
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full"
                />
            ) : (
                <>
                    <span>ACCESS DASHBOARD</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
            )}
          </button>
        </form>

        <button 
          onClick={onBack}
          className="w-full mt-6 text-white/40 hover:text-white text-sm font-bold transition-colors uppercase tracking-widest"
        >
          Return to Site
        </button>
      </motion.div>
    </div>
  );
};
