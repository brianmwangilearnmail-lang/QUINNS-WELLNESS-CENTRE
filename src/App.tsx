import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage, PrivacyPage } from './pages/StaticPages';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { motion, AnimatePresence } from 'motion/react';
import { SiteProvider } from './context/SiteContext';
import { CartProvider } from './context/CartContext';
import { WhatsAppButton } from './components/WhatsAppButton';

export type Page = 'home' | 'about' | 'contact' | 'privacy' | 'admin-login' | 'admin-dashboard' | 'admin';

function MainApp() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('aba_admin_auth') === 'true';
  });

  // Handle URL path and hash routing
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash.replace('#', '');
      const rawPath = window.location.pathname.replace(/^\//, '');

      const validPages = ['home', 'about', 'contact', 'privacy', 'admin-login', 'admin-dashboard', 'admin'];
      let targetPage: Page = 'home';

      // Hash takes priority for in-app navigation; path used for direct URL entry
      if (validPages.includes(hash)) {
        targetPage = hash as Page;
      } else if (validPages.includes(rawPath)) {
        targetPage = rawPath as Page;
      }

      // Guard: redirect to login if not authenticated
      if ((targetPage === 'admin-dashboard' || targetPage === 'admin') && !isAuthenticated) {
        setCurrentPage('admin-login');
      } else if (targetPage === 'admin' && isAuthenticated) {
        setCurrentPage('admin-dashboard');
      } else {
        setCurrentPage(targetPage);
      }
    };

    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    handleRoute();
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('aba_admin_auth', 'true');
    setCurrentPage('admin-dashboard');
    window.history.pushState({}, '', '/');
    window.location.hash = 'admin-dashboard';
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('aba_admin_auth');
    setCurrentPage('home');
    window.history.pushState({}, '', '/');
    window.location.hash = 'home';
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage activeBrand={activeBrand} onBrandFilter={setActiveBrand} />;
      case 'about': return <AboutPage />;
      case 'contact': return <ContactPage />;

      case 'privacy': return <PrivacyPage />;
      case 'admin-login': return <AdminLoginPage onLogin={handleLogin} onBack={() => { setCurrentPage('home'); window.location.hash='home'; }} />;
      case 'admin-dashboard': return isAuthenticated ? <AdminDashboardPage onLogout={handleLogout} /> : <AdminLoginPage onLogin={handleLogin} onBack={() => { setCurrentPage('home'); window.location.hash='home'; }} />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-white relative font-sans selection:bg-[#15803d] selection:text-white">
      {/* Topographic Background Pattern */}
      <div className="topo-pattern z-0 fixed inset-0 pointer-events-none"></div>

      {currentPage !== 'admin-dashboard' && currentPage !== 'admin-login' && (
      <Header 
        currentPage={currentPage} 
        onPageChange={(p) => { setCurrentPage(p); window.location.hash = p; }} 
        onCartToggle={() => setIsCartOpen(true)}
        onBrandFilter={(brand) => { setActiveBrand(brand); }}
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
      
      {/* Global WhatsApp Hover Button */}
      {currentPage !== 'admin-dashboard' && currentPage !== 'admin-login' && (
        <WhatsAppButton />
      )}
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
