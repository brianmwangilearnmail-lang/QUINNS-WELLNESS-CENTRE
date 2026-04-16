import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Plus, Trash2, Edit2, LogOut, Package, Image as ImageIcon, Layout, Save, X, Check, Upload, CloudUpload, BarChart3, MessageSquare, Download, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite, Product } from '../context/SiteContext';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { supabase } from '../lib/supabase';

interface AdminDashboardPageProps {
  onLogout: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onLogout }) => {
  const { products, hero, updateHero, updateProduct, addProduct, deleteProduct } = useSite();
  const [activeTab, setActiveTab] = useState<'hero' | 'products' | 'analytics' | 'inquiries'>('analytics');
  
  // Hero form state
  const [heroForm, setHeroForm] = useState(hero);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  // Product Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

  useEffect(() => {
    if (activeTab === 'inquiries') {
      fetchInquiries();
    }
  }, [activeTab]);

  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (!error && data) setInquiries(data);
    setLoadingInquiries(false);
  };

  const downloadCSV = () => {
    if (inquiries.length === 0) return;
    const headers = ['ID', 'Date', 'First Name', 'Last Name', 'Email', 'Subject', 'Message'];
    const csvContent = [
      headers.join(','),
      ...inquiries.map(iq => {
        const esc = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
        return [iq.id, esc(new Date(iq.created_at).toLocaleDateString()), esc(iq.first_name), esc(iq.last_name), esc(iq.email), esc(iq.subject), esc(iq.message)].join(',');
      })
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Website_Inquiries.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleHeroSave = () => {
    updateHero(heroForm);
    alert('Hero section updated successfully!');
  };

  const handleToggleProductStatus = (id: number, currentStatus: boolean) => {
    updateProduct(id, { inStock: !currentStatus });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Auto-compress image using canvas before storing
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const MAX_SIZE = 1200;
      let { width, height } = img;

      // Scale down if too large
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, width, height);

      // Preserve PNG transparency; use JPEG only for photos
      const isPng = file.type === 'image/png';
      const compressed = isPng
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', 0.85);
      URL.revokeObjectURL(objectUrl);
      callback(compressed);
    };

    img.src = objectUrl;
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingProduct({
      title: '',
      composition: '',
      description: '',
      brand: 'Natural Factors',
      price: 0,
      image: '',
      inStock: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (modalMode === 'add') {
      addProduct(editingProduct as Omit<Product, 'id'>);
    } else {
      updateProduct(editingProduct.id!, editingProduct);
    }
    
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#15803d] rounded-xl flex items-center justify-center text-white">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-black text-3xl text-gray-900 uppercase tracking-tighter">CMS Dashboard</h1>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Logged in as ABA_HEALTH</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="px-6 py-2 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 border border-gray-200 hover:border-red-500/50 rounded-xl transition-all flex items-center gap-2 font-bold text-sm"
          >
            <LogOut className="w-4 h-4" /> LOG OUT
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <div className="lg:col-span-1 space-y-4">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 font-black tracking-widest text-sm uppercase ${activeTab === 'analytics' ? 'bg-[#15803d] text-white border-[#15803d]' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
            >
              <BarChart3 className="w-5 h-5" /> Analytics
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 font-black tracking-widest text-sm uppercase ${activeTab === 'products' ? 'bg-[#15803d] text-white border-[#15803d]' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
            >
              <Package className="w-5 h-5" /> Product Catalog
            </button>
            <button 
              onClick={() => setActiveTab('hero')}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 font-black tracking-widest text-sm uppercase ${activeTab === 'hero' ? 'bg-[#15803d] text-white border-[#15803d]' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
            >
              <Layout className="w-5 h-5" /> Hero Section
            </button>
            <button 
              onClick={() => setActiveTab('inquiries')}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 font-black tracking-widest text-sm uppercase ${activeTab === 'inquiries' ? 'bg-[#15803d] text-white border-[#15803d]' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
            >
              <MessageSquare className="w-5 h-5" /> Inquiries
            </button>
          </div>

          {/* Main Controls */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'analytics' ? (
                <motion.div 
                  key="analytics-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <AnalyticsDashboard />
                </motion.div>
              ) : activeTab === 'hero' ? (
                <motion.div 
                  key="hero-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <Layout className="w-6 h-6 text-[#15803d]" />
                        <h2 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tighter">Hero Section Settings</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6 text-left">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Main Heading (Top)</label>
                                <input 
                                    type="text" 
                                    value={heroForm.titleTop}
                                    onChange={(e) => setHeroForm({...heroForm, titleTop: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Main Heading (Bottom)</label>
                                <input 
                                    type="text" 
                                    value={heroForm.titleBottom}
                                    onChange={(e) => setHeroForm({...heroForm, titleBottom: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Hero Subtitle</label>
                            <textarea 
                                rows={3}
                                value={heroForm.subtitle}
                                onChange={(e) => setHeroForm({...heroForm, subtitle: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors resize-none text-sm" 
                            />
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <ImageIcon className="w-5 h-5 text-[#14532d]" />
                                <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Visual Preview</h3>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="w-32 h-40 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden group relative">
                                     {heroForm.mainImage ? (
                                        <img src={heroForm.mainImage} className="w-full h-full object-contain p-2" alt="Hero" />
                                     ) : (
                                        <ImageIcon className="w-10 h-10 text-white/10" />
                                     )}
                                     <div 
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                        onClick={() => heroFileInputRef.current?.click()}
                                     >
                                         <Upload className="w-8 h-8 text-[#15803d]" />
                                     </div>
                                </div>
                                <div className="space-y-4 flex-grow text-left">
                                    <p className="text-gray-400 text-xs">Recommended: High-resolution supplement photos with transparent backgrounds.</p>
                                    <input 
                                        type="file" 
                                        ref={heroFileInputRef}
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, (base64) => setHeroForm({...heroForm, mainImage: base64}))}
                                    />
                                    <button 
                                      className="px-6 py-2 bg-[#15803d]/10 hover:bg-[#15803d]/20 text-[#15803d] rounded-lg text-sm font-black tracking-widest transition-all border border-[#15803d]/20"
                                      onClick={() => heroFileInputRef.current?.click()}
                                    >
                                        UPLOAD NEW IMAGE
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                          onClick={handleHeroSave}
                          className="w-full bg-[#15803d] hover:bg-[#114022] text-white py-4 rounded-xl font-black text-lg tracking-widest transition-all hover:shadow-[0_10px_30px_rgba(21,128,61,0.4)] flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                        >
                            <Save className="w-6 h-6" /> SAVE HERO CHANGES
                        </button>
                    </div>
                </motion.div>
              ) : activeTab === 'products' ? (
                <motion.div 
                  key="products-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <Package className="w-6 h-6 text-[#15803d]" />
                                <h2 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tighter">Product Management</h2>
                            </div>
                            <button 
                              onClick={openAddModal}
                              className="px-6 py-2 bg-[#14532d] hover:bg-[#114022] text-white rounded-xl font-black text-xs tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
                            >
                                <Plus className="w-4 h-4" /> ADD NEW
                            </button>
                        </div>

                        <div className="overflow-x-auto text-left">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#14532d]">Product Info</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#14532d]">Price</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#14532d]">Status</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#14532d] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {product.image ? (
                                                            <img src={product.image} className="w-full h-full object-contain p-1" alt={product.title} />
                                                        ) : (
                                                            <Package className="w-5 h-5 text-white/20" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-900 font-bold text-sm leading-tight">{product.title}</p>
                                                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter">{product.brand}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-900 font-black text-sm">
                                                Ksh {product.price.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4">
                                                <button 
                                                    onClick={() => handleToggleProductStatus(product.id, product.inStock)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${product.inStock ? 'bg-[#15803d] text-white' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}
                                                >
                                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                                </button>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                      onClick={() => openEditModal(product)}
                                                      className="p-2 hover:bg-[#15803d] hover:text-black rounded-lg text-white transition-all"
                                                    >
                                                      <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                                                    </button>
                                                    <button 
                                                      onClick={() => { if(window.confirm('Delete this product?')) deleteProduct(product.id); }}
                                                      className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
              ) : activeTab === 'inquiries' ? (
                <motion.div 
                  key="inquiries-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <MessageSquare className="w-6 h-6 text-[#15803d]" />
                                <h2 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tighter">Customer Inquiries</h2>
                            </div>
                            <button 
                              onClick={downloadCSV}
                              disabled={inquiries.length === 0}
                              className="px-6 py-2 bg-[#14532d] hover:bg-[#114022] disabled:bg-gray-300 text-white rounded-xl font-black text-xs tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
                            >
                                <Download className="w-4 h-4" /> DOWNLOAD CSV
                            </button>
                        </div>

                        <div className="overflow-x-auto text-left">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#14532d]">Date</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#14532d]">Customer</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#14532d]">Subject</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#14532d]">Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingInquiries ? (
                                        <tr><td colSpan={4} className="py-8 text-center text-gray-500 font-medium">Loading inquiries...</td></tr>
                                    ) : inquiries.length === 0 ? (
                                        <tr><td colSpan={4} className="py-8 text-center text-gray-500 font-medium">No inquiries received yet.</td></tr>
                                    ) : (
                                        inquiries.map((iq) => (
                                            <tr 
                                                key={iq.id} 
                                                className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group"
                                                onClick={() => setSelectedInquiry(iq)}
                                            >
                                                <td className="py-4 px-4 text-xs font-bold text-gray-500 whitespace-nowrap group-hover:text-[#15803d] transition-colors">
                                                    {new Date(iq.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="text-gray-900 font-bold text-sm">{iq.first_name} {iq.last_name}</p>
                                                    <a href={`mailto:${iq.email}`} className="text-[#15803d] hover:underline text-xs">{iq.email}</a>
                                                </td>
                                                <td className="py-4 px-4 text-gray-900 font-bold text-sm uppercase tracking-tighter">
                                                    {iq.subject}
                                                </td>
                                                <td className="py-4 px-4 text-gray-600 text-sm max-w-xs truncate" title={iq.message}>
                                                    {iq.message}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInquiry(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#15803d] rounded-xl flex items-center justify-center text-white">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h2 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tighter">
                    Inquiry Details
                  </h2>
                </div>
                <button onClick={() => setSelectedInquiry(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 text-left">
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Customer</p>
                        <p className="font-bold text-gray-900">{selectedInquiry.first_name} {selectedInquiry.last_name}</p>
                        <p className="text-sm text-[#14532d]">{selectedInquiry.email}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Date Submitted</p>
                        <p className="font-bold text-gray-900">{new Date(selectedInquiry.created_at).toLocaleString()}</p>
                    </div>
                </div>

                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Subject</p>
                    <p className="font-black text-xl text-gray-900 uppercase tracking-tight">{selectedInquiry.subject}</p>
                </div>

                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Message</p>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-gray-700 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                        {selectedInquiry.message}
                    </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                  <a 
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedInquiry.email)}&su=${encodeURIComponent(`Re: ${selectedInquiry.subject}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#15803d] hover:bg-[#114022] text-white py-4 rounded-xl font-black text-sm tracking-widest transition-all hover:shadow-[0_10px_30px_rgba(21,128,61,0.4)] flex items-center justify-center gap-3 active:scale-95 text-center"
                  >
                    <Mail className="w-5 h-5" /> REPLY VIA GMAIL
                  </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Edit/Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#15803d] rounded-xl flex items-center justify-center text-black">
                    {modalMode === 'add' ? <Plus className="w-6 h-6" /> : <Edit2 className="w-6 h-6" />}
                  </div>
                  <h2 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tighter">
                    {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
                  </h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8 mb-4">
                    {/* Image Upload Area */}
                    <div className="w-full md:w-1/3 flex flex-col gap-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#14532d] ml-1">Product Photo</label>
                        <div 
                            className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-[#14532d]/50 transition-colors overflow-hidden relative"
                            onClick={() => productFileInputRef.current?.click()}
                        >
                            {editingProduct?.image ? (
                                <>
                                    <img src={editingProduct.image} className="w-full h-full object-contain p-4" alt="Preview" />
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <CloudUpload className="w-10 h-10 text-[#14532d]" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <CloudUpload className="w-6 h-6 text-gray-400 group-hover:text-[#14532d]" />
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-gray-900 font-bold text-xs">Click to upload</p>
                                        <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-tighter">PNG, JPG up to 2MB</p>
                                    </div>
                                </>
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={productFileInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (base64) => setEditingProduct({...editingProduct!, image: base64}))}
                        />
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#14532d] ml-1">Product Title</label>
                            <input 
                                type="text" 
                                required
                                value={editingProduct?.title || ''}
                                onChange={(e) => setEditingProduct({...editingProduct!, title: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors font-medium" 
                                placeholder="e.g. Omega-3 Fish Oil"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#14532d] ml-1">Brand Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={editingProduct?.brand || ''}
                                    onChange={(e) => setEditingProduct({...editingProduct!, brand: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors text-sm" 
                                    placeholder="e.g. Natural Factors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#14532d] ml-1">Price (KSh)</label>
                                <input 
                                    type="number" 
                                    required
                                    value={editingProduct?.price || ''}
                                    onChange={(e) => setEditingProduct({...editingProduct!, price: Number(e.target.value)})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors text-sm" 
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="space-y-4 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#14532d] ml-1">Composition</label>
                                <textarea 
                                    rows={2}
                                    required
                                    value={editingProduct?.composition || ''}
                                    onChange={(e) => setEditingProduct({...editingProduct!, composition: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors resize-none text-sm" 
                                    placeholder="e.g. 10 Strains for Optimal Gut Flora"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#14532d] ml-1">Description</label>
                                <textarea 
                                    rows={3}
                                    required
                                    value={editingProduct?.description || ''}
                                    onChange={(e) => setEditingProduct({...editingProduct!, description: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors resize-none text-sm" 
                                    placeholder="e.g. A premium health supplement designed for..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#14532d] ml-1">Manual Image URL (Optional)</label>
                        <input 
                            type="text" 
                            value={editingProduct?.image || ''}
                            onChange={(e) => setEditingProduct({...editingProduct!, image: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors text-xs" 
                            placeholder="/images/product.png"
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 cursor-pointer h-[50px] mb-[2px]" onClick={() => setEditingProduct({...editingProduct!, inStock: !editingProduct?.inStock})}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${editingProduct?.inStock ? 'bg-[#14532d] border-[#14532d]' : 'border-gray-200'}`}>
                            {editingProduct?.inStock && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-gray-900 font-bold text-[10px] tracking-wider uppercase">In Stock</span>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl font-black text-xs tracking-widest transition-all border border-gray-200"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-[#15803d] hover:bg-[#114022] text-white py-4 rounded-xl font-black text-lg tracking-widest transition-all hover:shadow-[0_10px_30px_rgba(21,128,61,0.4)] flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                  >
                    <Save className="w-6 h-6" /> {modalMode === 'add' ? 'ADD TO SHOP' : 'SAVE CHANGES'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
