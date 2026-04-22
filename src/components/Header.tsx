import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, Menu, X, ChevronDown, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSite } from '../context/SiteContext';
import { motion, AnimatePresence } from 'motion/react';

interface SearchResult {
  id: number;
  title: string;
  brand: string;
  image?: string;
}

interface HeaderProps {
  onPageChange: (page: 'home' | 'about' | 'contact' | 'science' | 'privacy') => void;
  currentPage: string;
  onCartToggle: () => void;
  onBrandFilter: (brand: string | null) => void;
}

// ── Fuzzy scoring ─────────────────────────────────────────────────────────────
function fuzzyScore(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 85;
  if (t.includes(q)) return 70;

  // Token-level matching (handles "fish oil omega" → "omega fish oil")
  const tokens = t.split(/[\s\-,/()]+/);
  const qTokens = q.split(/[\s\-,/()]+/).filter(Boolean);
  const tokenMatches = qTokens.filter(qt => tokens.some(tk => tk.startsWith(qt) || tk.includes(qt))).length;
  if (tokenMatches > 0) return 45 + (tokenMatches / qTokens.length) * 20;

  // Character sequence matching (handles typos: "omaga" → "omega")
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  const ratio = qi / q.length;
  if (ratio >= 0.8) return 35;
  if (ratio >= 0.65) return 20;
  return 0;
}

export const Header: React.FC<HeaderProps> = ({ onPageChange, currentPage, onCartToggle, onBrandFilter }) => {
  const { totalItems } = useCart();
  const { products, brands } = useSite();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBrandsMenu, setShowBrandsMenu] = useState(false);
  const [showMobileBrands, setShowMobileBrands] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const brandsTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Auto-focus search input when it opens
  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 120);
  }, [isSearchOpen]);

  // Close results when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Search logic ─────────────────────────────────────────────────────────────
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); setShowResults(false); return; }

    const scored = products.map(p => ({
      id: p.id,
      title: p.title,
      brand: p.brand || '',
      image: p.image,
      score: Math.max(
        fuzzyScore(p.title, query) * 1.5,
        fuzzyScore(p.brand || '', query) * 1.2,
        fuzzyScore(p.composition || '', query) * 0.6,
        fuzzyScore(p.description || '', query) * 0.4,
      ),
    })).filter(r => r.score > 15).sort((a, b) => b.score - a.score).slice(0, 8);

    setSearchResults(scored);
    setShowResults(true);
  }, [products]);

  const handleSearchSelect = (result: SearchResult) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setShowResults(false);
    onBrandFilter(null);
    onPageChange('home');
    setTimeout(() => {
      document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const el = document.getElementById(`product-${result.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.transition = 'box-shadow 0.3s ease';
          el.style.boxShadow = '0 0 0 3px #14532d, 0 0 0 6px rgba(20,83,45,0.2)';
          setTimeout(() => { el.style.boxShadow = ''; }, 2200);
        }
      }, 600);
    }, 300);
  };

  // ── Brand navigation ──────────────────────────────────────────────────────────
  const handleBrandSelect = (brandName: string) => {
    setShowBrandsMenu(false);
    setIsMobileMenuOpen(false);
    onBrandFilter(brandName);
    onPageChange('home');
    setTimeout(() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' }), 300);
  };

  const handleMobileNav = (page: 'home' | 'about' | 'contact' | 'science' | 'privacy') => {
    setIsMobileMenuOpen(false);
    onPageChange(page);
    if (page === 'home') {
      setTimeout(() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' }), 300);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="relative z-50 bg-white shadow-md sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 xl:h-24 gap-4">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onPageChange('home')}>
            <span className="font-display font-black text-xl md:text-2xl xl:text-3xl text-[#14532d] tracking-tighter">
              QUINS WELLNESS
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center space-x-6">
            <button
              onClick={() => { onPageChange('home'); setTimeout(() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              className={`font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${currentPage === 'home' ? 'text-[#14532d]' : 'text-gray-900 hover:text-[#14532d]'}`}
            >
              Products
            </button>

            {/* ── Shop by Brand dropdown ── */}
            <div
              className="relative"
              onMouseEnter={() => { clearTimeout(brandsTimeout.current); setShowBrandsMenu(true); }}
              onMouseLeave={() => { brandsTimeout.current = setTimeout(() => setShowBrandsMenu(false), 200); }}
            >
              <button className={`font-bold text-sm uppercase tracking-wider transition-colors flex items-center gap-1 whitespace-nowrap ${showBrandsMenu ? 'text-[#14532d]' : 'text-gray-900 hover:text-[#14532d]'}`}>
                Shop by Brand
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showBrandsMenu ? 'rotate-180 text-[#14532d]' : ''}`} />
              </button>

              <AnimatePresence>
                {showBrandsMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-[200]"
                    onMouseEnter={() => clearTimeout(brandsTimeout.current)}
                    onMouseLeave={() => { brandsTimeout.current = setTimeout(() => setShowBrandsMenu(false), 200); }}
                  >
                    {/* Dropdown arrow */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45" />

                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Browse by Brand</p>

                    {brands.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4 italic">No brands available yet</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        {brands.map(brand => (
                          <button
                            key={brand.id}
                            onClick={() => handleBrandSelect(brand.name)}
                            className="text-left px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-[#14532d] hover:text-white transition-all duration-150 group"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Tag className="w-3 h-3 flex-shrink-0 opacity-50 group-hover:opacity-100" />
                              <span className="truncate">{brand.name}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setShowBrandsMenu(false);
                          onBrandFilter(null);
                          onPageChange('home');
                          setTimeout(() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        }}
                        className="w-full text-center text-xs font-black text-[#14532d] hover:underline uppercase tracking-wider py-1"
                      >
                        View All Products →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => onPageChange('about')} className={`font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${currentPage === 'about' ? 'text-[#14532d]' : 'text-gray-900 hover:text-[#14532d]'}`}>
              About Us
            </button>
            <button onClick={() => onPageChange('contact')} className={`font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${currentPage === 'contact' ? 'text-[#14532d]' : 'text-gray-900 hover:text-[#14532d]'}`}>
              Contact
            </button>
            <button onClick={() => onPageChange('science')} className={`font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${currentPage === 'science' ? 'text-[#14532d]' : 'text-gray-900 hover:text-[#14532d]'}`}>
              Our Science
            </button>
          </nav>

          {/* Icons & CTA */}
          <div className="hidden xl:flex items-center space-x-3">

            {/* ── Search ── */}
            <div className="relative" ref={searchRef}>
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div
                    key="search-open"
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: 250, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 overflow-hidden"
                  >
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => handleSearch(e.target.value)}
                      onFocus={() => searchQuery && setShowResults(true)}
                      placeholder="Search products..."
                      className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 px-2 placeholder:text-gray-400 min-w-0"
                    />
                    <button
                      onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setShowResults(false); }}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-700 ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="search-icon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSearchOpen(true)}
                    className="text-gray-900 hover:text-[#14532d] transition-colors p-2"
                    title="Search products"
                  >
                    <Search className="w-6 h-6" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showResults && isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[200] overflow-hidden"
                  >
                    {searchResults.length > 0 ? (
                      <>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-4 pt-3 pb-1">
                          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                        </p>
                        {searchResults.map(result => (
                          <button
                            key={result.id}
                            onClick={() => handleSearchSelect(result)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group border-b border-gray-50 last:border-0"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {result.image ? (
                                <img src={result.image} className="w-full h-full object-contain p-1" alt={result.title} />
                              ) : (
                                <Tag className="w-4 h-4 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[#14532d] transition-colors">{result.title}</p>
                              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{result.brand}</p>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="p-6 text-center">
                        <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-400">No results for</p>
                        <p className="text-sm font-black text-gray-600">"{searchQuery}"</p>
                        <p className="text-[10px] text-gray-400 mt-1">Try a different spelling or keyword</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <button onClick={onCartToggle} className="text-gray-900 hover:text-[#14532d] transition-colors relative p-2">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-[#14532d] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center border-2 border-white translate-x-1 -translate-y-1">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Free Consultation CTA */}
            <a
              href="https://wa.me/254726138466?text=Hi%20Quins%20Wellness%2C%20I%27d%20like%20a%20free%20health%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex border-2 border-[#14532d] text-[#14532d] hover:bg-[#14532d] hover:text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all hover:-translate-y-0.5 whitespace-nowrap"
            >
              Free Consultation
            </a>
            <button
              onClick={() => { onPageChange('home'); setTimeout(() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              className="bg-[#14532d] hover:bg-[#114022] text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_14px_0_rgba(20,83,45,0.39)] hover:shadow-[0_6px_20px_rgba(20,83,45,0.23)] hover:-translate-y-0.5 whitespace-nowrap"
            >
              SHOP NOW
            </button>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="xl:hidden flex items-center gap-3">
            <button onClick={onCartToggle} className="text-gray-900 hover:text-[#14532d] relative p-1">
              <ShoppingCart className="w-7 h-7" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#14532d] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-900 hover:text-[#14532d]">
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] xl:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-screen w-[85%] max-w-[340px] bg-white z-[100] shadow-2xl flex flex-col xl:hidden"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <span className="font-display font-black text-2xl text-[#14532d] tracking-tighter">QUINS WELLNESS</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-black bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile search */}
              <div className="px-6 pt-4 pb-2">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
                  />
                  {searchQuery && <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-gray-400"><X className="w-4 h-4" /></button>}
                </div>
                {searchQuery && searchResults.length > 0 && (
                  <div className="mt-2 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map(r => (
                      <button key={r.id} onClick={() => handleSearchSelect(r)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {r.image ? <img src={r.image} className="w-full h-full object-contain p-0.5" alt={r.title} /> : <Tag className="w-3 h-3 m-auto text-gray-300 mt-2" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{r.title}</p>
                          <p className="text-[10px] text-gray-400 uppercase">{r.brand}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col p-6 space-y-1 flex-grow overflow-y-auto">
                <button onClick={() => handleMobileNav('home')} className={`text-left font-black text-xl tracking-tight transition-colors py-3 ${currentPage === 'home' ? 'text-[#14532d]' : 'text-gray-900'}`}>
                  SHOP PRODUCTS
                </button>

                {/* Mobile Shop by Brand accordion */}
                <div>
                  <button
                    onClick={() => setShowMobileBrands(!showMobileBrands)}
                    className="w-full text-left font-black text-xl tracking-tight text-gray-900 py-3 flex items-center justify-between"
                  >
                    SHOP BY BRAND
                    <ChevronDown className={`w-5 h-5 transition-transform ${showMobileBrands ? 'rotate-180 text-[#14532d]' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showMobileBrands && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 pb-3 space-y-1">
                          {brands.length === 0 ? (
                            <p className="text-sm text-gray-400 italic py-2">No brands available</p>
                          ) : (
                            brands.map(brand => (
                              <button
                                key={brand.id}
                                onClick={() => handleBrandSelect(brand.name)}
                                className="w-full text-left py-2 px-3 rounded-xl text-base font-bold text-gray-600 hover:text-[#14532d] hover:bg-green-50 transition-colors flex items-center gap-2"
                              >
                                <Tag className="w-3.5 h-3.5 opacity-50" />
                                {brand.name}
                              </button>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button onClick={() => handleMobileNav('about')} className={`text-left font-black text-xl tracking-tight transition-colors py-3 ${currentPage === 'about' ? 'text-[#14532d]' : 'text-gray-900'}`}>
                  ABOUT US
                </button>
                <button onClick={() => handleMobileNav('science')} className={`text-left font-black text-xl tracking-tight transition-colors py-3 ${currentPage === 'science' ? 'text-[#14532d]' : 'text-gray-900'}`}>
                  OUR SCIENCE
                </button>
                <button onClick={() => handleMobileNav('contact')} className={`text-left font-black text-xl tracking-tight transition-colors py-3 ${currentPage === 'contact' ? 'text-[#14532d]' : 'text-gray-900'}`}>
                  CONTACT
                </button>
              </div>

              <div className="p-6 border-t border-gray-100 space-y-3">
                <a
                  href="https://wa.me/254726138466?text=Hi%20Quins%20Wellness%2C%20I%27d%20like%20a%20free%20health%20consultation."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full border-2 border-[#14532d] text-[#14532d] py-4 rounded-xl font-black text-sm tracking-widest flex items-center justify-center gap-2 uppercase"
                >
                  💬 Get Free Consultation
                </a>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); onCartToggle(); }}
                  className="w-full bg-[#14532d] text-white py-4 rounded-xl font-black text-lg tracking-widest flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-6 h-6" /> VIEW CART ({totalItems})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
