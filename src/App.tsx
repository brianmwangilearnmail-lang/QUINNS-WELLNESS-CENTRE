import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage, SciencePage, PrivacyPage } from './pages/StaticPages';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { motion, AnimatePresence } from 'motion/react';
import { SiteProvider } from './context/SiteContext';
import { CartProvider } from './context/CartContext';

export type Page = 'home' | 'about' | 'contact' | 'science' | 'privacy' | 'admin-login' | 'admin-dashboard' | 'admin';

function MainApp() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('aba_admin_auth') === 'true';
  });

  // Handle URL hash or simple routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as Page;
      const path = window.location.pathname.replace('/', '') as Page;
      
      const targetPage = hash || (path === 'admin' ? 'admin' : 'home');

      if (['home', 'about', 'contact', 'science', 'privacy', 'admin-login', 'admin-dashboard', 'admin'].includes(targetPage)) {
        // Redirect to login if trying to access dashboard/admin while not authenticated
        if ((targetPage === 'admin-dashboard' || targetPage === 'admin') && !isAuthenticated) {
          setCurrentPage('admin-login');
          if (targetPage === 'admin') {
            // We stay on /admin but show login
          } else {
            window.location.hash = 'admin-login';
          }
        } else if (targetPage === 'admin' && isAuthenticated) {
          setCurrentPage('admin-dashboard');
        } else {
          setCurrentPage(targetPage as Page);
        }
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('aba_admin_auth', 'true');
    setCurrentPage('admin-dashboard');
    window.location.hash = 'admin-dashboard';
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('aba_admin_auth');
    setCurrentPage('home');
    window.location.hash = 'home';
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'about': return <AboutPage />;
      case 'contact': return <ContactPage />;
      case 'science': return <SciencePage />;
      case 'privacy': return <PrivacyPage />;
      case 'admin-login': return <AdminLoginPage onLogin={handleLogin} onBack={() => { setCurrentPage('home'); window.location.hash='home'; }} />;
      case 'admin-dashboard': return isAuthenticated ? <AdminDashboardPage onLogout={handleLogout} /> : <AdminLoginPage onLogin={handleLogin} onBack={() => { setCurrentPage('home'); window.location.hash='home'; }} />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-electric-blue relative font-sans selection:bg-[#ccff00] selection:text-black">
      {/* Topographic Background Pattern */}
      <div className="topo-pattern z-0 fixed inset-0 pointer-events-none"></div>

      {currentPage !== 'admin-dashboard' && currentPage !== 'admin-login' && (
      <Header 
        currentPage={currentPage} 
        onPageChange={(p) => { setCurrentPage(p); window.location.hash = p; }} 
        onCartToggle={() => setIsCartOpen(true)} 
      />
      )}

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      {currentPage !== 'admin-dashboard' && currentPage !== 'admin-login' && (
      <Footer onPageChange={(p) => { setCurrentPage(p); window.location.hash = p; window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </SiteProvider>
  );
}
