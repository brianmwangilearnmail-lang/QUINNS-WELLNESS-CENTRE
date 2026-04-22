import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Plus, Trash2, Edit2, LogOut, Package, Image as ImageIcon, Layout, Save, X, Check, Upload, CloudUpload, BarChart3, MessageSquare, Download, Mail, ShoppingBag, Clock, CheckCircle2, Truck, Settings, Loader2, Tag } from 'lucide-react';
import { getEmailSettings, connectGmail, clearEmailSettings, sendDispatchReceipt, EmailSettings } from '../lib/emailService';
import { motion, AnimatePresence } from 'motion/react';
import { useSite, Product, Order, HeroBanner, Brand } from '../context/SiteContext';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { supabase } from '../lib/supabase';

interface AdminDashboardPageProps {
  onLogout: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onLogout }) => {
  const { products, hero, orders, updateHero, updateProduct, addProduct, deleteProduct, updateOrderStatus, brands, addBrand, deleteBrand } = useSite();
  const [activeTab, setActiveTab] = useState<'hero' | 'products' | 'analytics' | 'inquiries' | 'orders' | 'settings' | 'brands'>('analytics');
  
  // Email Settings state
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(getEmailSettings());
  const [clientIdInput, setClientIdInput] = useState(emailSettings?.clientId || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Banner state
  const [banners, setBanners] = useState<HeroBanner[]>(hero);
  const bannerFileInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  
  // Custom Notification state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Custom Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  } | null>(null);

  // Brand modal state
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [useCustomBrand, setUseCustomBrand] = useState(false);
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (hero) setBanners(hero);
  }, [hero]);

  const handleHeroSave = () => {
    updateHero(banners);
    setNotification({ message: 'Banners updated successfully!', type: 'success' });
  };

  const handleAddBanner = () => {
    if (banners.length >= 5) {
      setNotification({ message: 'Maximum 5 banners allowed.', type: 'error' });
      return;
    }
    const newBanner: any = {
      titleTop: 'BRAND NEW',
      titleBottom: 'WELLNESS',
      subtitle: 'Premium health solutions delivered to your doorstep.',
      image: '',
      order_index: banners.length
    };
    setBanners([...banners, newBanner]);
  };

  const handleRemoveBanner = (index: number) => {
    setConfirmModal({
      title: 'Remove Banner',
      message: 'Are you sure you want to remove this banner? This action cannot be undone until you save.',
      confirmText: 'REMOVE',
      onConfirm: () => {
        setBanners(banners.filter((_, i) => i !== index));
        setConfirmModal(null);
      }
    });
  };

  const handleUpdateBanner = (index: number, updates: Partial<HeroBanner>) => {
    const newBanners = [...banners];
    newBanners[index] = { ...newBanners[index], ...updates };
    setBanners(newBanners);
  };

  // Product Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

  // Order state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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



  const handleToggleProductStatus = (id: number, currentStatus: boolean) => {
    updateProduct(id, { inStock: !currentStatus });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotification({ message: 'Please select a valid image file.', type: 'error' });
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
      brand: '',
      price: 0,
      image: '',
      inStock: true
    });
    setUseCustomBrand(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setUseCustomBrand(false);
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

  const handleConnectEmail = async () => {
    if (!clientIdInput.trim()) {
      setNotification({ message: 'Please enter a Google Client ID first.', type: 'info' });
      return;
    }
    setIsConnecting(true);
    try {
      const settings = await connectGmail(clientIdInput.trim());
      setEmailSettings(settings);
      setNotification({ message: `Successfully connected to ${settings.connectedEmail}`, type: 'success' });
    } catch (error: any) {
      console.error('Connection failed:', error);
      setNotification({ message: `Failed to connect Gmail: ${error.message}`, type: 'error' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectEmail = () => {
    setConfirmModal({
      title: 'Disconnect Gmail',
      message: 'Are you sure you want to disconnect your Gmail account? Automated receipts will stop sending to customers.',
      confirmText: 'DISCONNECT',
      onConfirm: () => {
        clearEmailSettings();
        setEmailSettings(null);
        setConfirmModal(null);
        setNotification({ message: 'Gmail disconnected successfully', type: 'info' });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'dispatched': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'completed': return 'bg-green-100 text-green-700 border-green-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-20">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[200] min-w-[320px]"
          >
            <div className={`p-1 rounded-2xl shadow-2xl backdrop-blur-xl ${
              notification.type === 'success' ? 'bg-green-500/20 border border-green-500/30' : 
              notification.type === 'error' ? 'bg-red-500/20 border border-red-500/30' : 
              'bg-[#15803d]/20 border border-[#15803d]/30'
            }`}>
              <div className="bg-white/90 rounded-xl px-6 py-4 flex items-center gap-4">
                {notification.type === 'success' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : notification.type === 'error' ? (
                  <X className="w-6 h-6 text-red-500" />
                ) : (
                  <Mail className="w-6 h-6 text-[#15803d]" />
                )}
                <div className="flex-grow">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Notification</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{notification.message}</p>
                </div>
                <button onClick={() => setNotification(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              onClick={() => setActiveTab('orders')}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 font-black tracking-widest text-sm uppercase ${activeTab === 'orders' ? 'bg-[#15803d] text-white border-[#15803d]' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
            >
              <ShoppingBag className="w-5 h-5" /> Orders
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
            <button 
              onClick={() => setActiveTab('brands')}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 font-black tracking-widest text-sm uppercase ${activeTab === 'brands' ? 'bg-[#15803d] text-white border-[#15803d]' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
            >
              <Tag className="w-5 h-5" /> Brands
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 font-black tracking-widest text-sm uppercase ${activeTab === 'settings' ? 'bg-[#15803d] text-white border-[#15803d]' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
            >
              <Settings className="w-5 h-5" /> Settings
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
              ) : activeTab === 'orders' ? (
                <motion.div 
                   key="orders-tab"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-6"
                 >
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <ShoppingBag className="w-6 h-6 text-[#15803d]" />
                                <h2 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tighter">Order Management</h2>
                            </div>
                        </div>

                        <div className="overflow-x-auto text-left">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#14532d]">Order ID</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#14532d]">Customer</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#14532d]">Date</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#14532d]">Total</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#14532d]">Status</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#14532d] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr><td colSpan={6} className="py-8 text-center text-gray-500 font-medium">No orders found.</td></tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                                                <td className="py-4 px-4 text-sm font-black text-gray-900">
                                                    #{order.id.toString().slice(-6).toUpperCase()}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="text-gray-900 font-bold text-sm">{order.customer_name}</p>
                                                    <p className="text-gray-400 text-[10px]">{order.customer_email}</p>
                                                </td>
                                                <td className="py-4 px-4 text-xs text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-4 text-gray-900 font-black text-sm">
                                                    Ksh {order.total_amount.toLocaleString()}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <button 
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="px-4 py-2 bg-gray-50 hover:bg-[#15803d] hover:text-white rounded-xl text-xs font-black tracking-widest transition-all border border-gray-200"
                                                    >
                                                        VIEW DETAILS
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                 </motion.div>
              ) : activeTab === 'hero' ? (
                <motion.div 
                  key="hero-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <Layout className="w-6 h-6 text-[#15803d]" />
                                <h2 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tighter">Hero Banners ({banners.length}/5)</h2>
                            </div>
                            <button 
                                onClick={handleAddBanner}
                                disabled={banners.length >= 5}
                                className="px-6 py-2 bg-[#14532d] hover:bg-[#114022] disabled:bg-gray-300 text-white rounded-xl font-black text-xs tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
                            >
                                <Plus className="w-4 h-4" /> ADD BANNER
                            </button>
                        </div>

                        <div className="space-y-12">
                            {banners.map((banner, index) => (
                                <div key={banner.id || index} className="group relative bg-gray-50 border border-gray-100 rounded-[2rem] p-8 transition-all hover:border-[#15803d]/30">
                                    <button 
                                        onClick={() => handleRemoveBanner(index)}
                                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="grid lg:grid-cols-3 gap-8">
                                        {/* Image Section */}
                                        <div className="lg:col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Widescreen Banner Image (16:9 Required)</label>
                                            <div 
                                                className="aspect-video bg-white border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#15803d] transition-all overflow-hidden relative group/img"
                                                onClick={() => bannerFileInputRefs.current[index]?.click()}
                                            >
                                                {banner.image ? (
                                                    <>
                                                        <img src={banner.image} className="w-full h-full object-cover" alt="Banner" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Upload className="w-10 h-10 text-white" />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="w-12 h-12 text-gray-200" />
                                                        <div className="text-center">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase">Click to upload 16:9 Banner</p>
                                                            <p className="text-[9px] text-gray-300 mt-1 uppercase">Recommended: 1920x1080px</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <input 
                                                type="file" 
                                                ref={el => bannerFileInputRefs.current[index] = el}
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, (base64) => handleUpdateBanner(index, { image: base64 }))}
                                            />
                                        </div>
 
                                        {/* Settings Section */}
                                        <div className="lg:col-span-1 space-y-6">
                                            <div className="space-y-4">
                                                <div className="p-4 bg-white rounded-2xl border border-gray-100">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Banner Status</p>
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span className="text-[10px] font-bold uppercase">Ready to Display</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#15803d] ml-1">Click Destination (Link)</label>
                                                    <input 
                                                        type="text" 
                                                        value={banner.link || ''}
                                                        onChange={(e) => handleUpdateBanner(index, { link: e.target.value })}
                                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#15803d] transition-all font-bold" 
                                                        placeholder="e.g. #shop-section"
                                                    />
                                                    <p className="text-[9px] text-gray-400 leading-tight px-1">Where should users go when they click this banner? Default is supplements section.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {banners.length === 0 && (
                                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                    <Layout className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 font-bold uppercase tracking-widest">No banners added yet</p>
                                    <button onClick={handleAddBanner} className="mt-4 text-[#15803d] font-black text-xs uppercase tracking-widest hover:underline">
                                        Add your first banner
                                    </button>
                                </div>
                            )}
                        </div>

                        {banners.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <button 
                                    onClick={handleHeroSave}
                                    className="w-full bg-[#15803d] hover:bg-[#114022] text-white py-4 rounded-xl font-black text-lg tracking-widest transition-all hover:shadow-[0_10px_30px_rgba(21,128,61,0.4)] flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                                >
                                    <Save className="w-6 h-6" /> SAVE ALL BANNERS
                                </button>
                            </div>
                        )}
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
                                                      onClick={() => { 
                                                        setConfirmModal({
                                                          title: 'Delete Product',
                                                          message: `Are you sure you want to delete "${product.title}"?`,
                                                          confirmText: 'DELETE',
                                                          onConfirm: () => {
                                                            deleteProduct(product.id);
                                                            setConfirmModal(null);
                                                            setNotification({ message: 'Product deleted successfully', type: 'success' });
                                                          }
                                                        });
                                                      }}
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
              ) : activeTab === 'brands' ? (
                <motion.div
                  key="brands-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-4">
                        <Tag className="w-6 h-6 text-[#15803d]" />
                        <h2 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tighter">Brand Management</h2>
                      </div>
                      <button
                        onClick={() => { setNewBrandName(''); setIsBrandModalOpen(true); }}
                        className="px-6 py-2 bg-[#14532d] hover:bg-[#114022] text-white rounded-xl font-black text-xs tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
                      >
                        <Plus className="w-4 h-4" /> ADD BRAND
                      </button>
                    </div>

                    {brands.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Tag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No brands yet</p>
                        <p className="text-xs text-gray-400 mt-1">Brands are auto-created from your products, or add custom ones above.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {brands.map(brand => {
                          const brandProducts = products.filter(p => p.brand === brand.name);
                          const productCount = brandProducts.length;
                          const isFromProducts = productCount > 0;
                          const isExpanded = expandedBrand === brand.name;
                          return (
                            <div key={brand.id} className={`bg-gray-50 border transition-all rounded-2xl overflow-hidden ${isExpanded ? 'border-[#15803d]' : 'border-gray-100 hover:border-[#15803d]/30'}`}>
                              <div 
                                onClick={() => setExpandedBrand(isExpanded ? null : brand.name)}
                                className="flex items-center justify-between p-4 cursor-pointer group"
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-[#15803d] text-white' : 'bg-[#15803d]/10 text-[#15803d]'}`}>
                                    <Tag className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-black text-gray-900 text-sm tracking-tight">{brand.name}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                                      {productCount} product{productCount !== 1 ? 's' : ''}
                                      {isFromProducts ? ' · from catalog' : ' · custom'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmModal({
                                        title: 'Delete Brand',
                                        message: isFromProducts 
                                          ? `Remove "${brand.name}"? This will also unassign the brand from ${productCount} product(s).` 
                                          : `Remove "${brand.name}" from the brand list?`,
                                        confirmText: 'DELETE',
                                        onConfirm: async () => { 
                                          await deleteBrand(brand.id, brand.name); 
                                          setConfirmModal(null); 
                                          setNotification({ message: 'Brand removed', type: 'success' }); 
                                        }
                                      });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-xl transition-all"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                  {isFromProducts && (
                                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mr-2">Auto</span>
                                  )}
                                </div>
                              </div>
                              <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-gray-100 bg-white"
                                    >
                                        {brandProducts.length > 0 ? (
                                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                {brandProducts.map(product => (
                                                    <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.title} className="w-10 h-10 object-contain bg-white rounded-lg p-1 border border-gray-200" />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                                                <ImageIcon className="w-4 h-4 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-gray-900 truncate">{product.title}</p>
                                                            <p className="text-[10px] text-gray-500 font-medium">KSh {product.price.toLocaleString()}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openEditModal(product); }}
                                                                className="p-1.5 text-gray-400 hover:text-[#15803d] hover:bg-[#15803d]/10 rounded-lg transition-colors"
                                                                title="Edit Product"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { 
                                                                    e.stopPropagation();
                                                                    setConfirmModal({
                                                                        title: 'Delete Product',
                                                                        message: `Are you sure you want to delete "${product.title}"?`,
                                                                        confirmText: 'DELETE',
                                                                        onConfirm: () => {
                                                                            deleteProduct(product.id);
                                                                            setConfirmModal(null);
                                                                            setNotification({ message: 'Product deleted successfully', type: 'success' });
                                                                        }
                                                                    });
                                                                }}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete Product"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-6 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                No products assigned to this brand yet
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-6 leading-relaxed">
                      💡 Brands tagged on products appear here automatically. Use <strong>Add Brand</strong> to pre-register a brand before assigning products.
                    </p>
                  </div>
                </motion.div>
              ) : activeTab === 'settings' ? (
                <motion.div 
                  key="settings-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center gap-4 mb-8">
                            <Settings className="w-6 h-6 text-[#15803d]" />
                            <h2 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tighter">System Settings</h2>
                        </div>

                        <div className="space-y-8">
                            {/* Email Integration Section */}
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                                        <Mail className="w-5 h-5 text-[#15803d]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 uppercase tracking-tight">Email Notifications</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Connect Gmail to send automated order receipts</p>
                                    </div>
                                </div>

                                <div className="space-y-6 max-w-2xl">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-[#14532d] ml-1">Google OAuth Client ID</label>
                                        <input 
                                            type="text" 
                                            value={clientIdInput}
                                            onChange={(e) => setClientIdInput(e.target.value)}
                                            placeholder="Enter your Google Client ID here..."
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#14532d] transition-all" 
                                        />
                                        <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                                            This ID is required to use Google's secure login system. You can generate one in the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#15803d] underline">Google Cloud Console</a>.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        {emailSettings ? (
                                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                                <div className="flex-grow flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3 w-full">
                                                    <CheckCircle2 className="w-5 h-5 text-[#15803d]" />
                                                    <div>
                                                        <p className="text-xs font-black text-[#15803d] uppercase tracking-tighter">Connected Account</p>
                                                        <p className="text-sm font-bold text-gray-900">{emailSettings.connectedEmail}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={handleDisconnectEmail}
                                                    className="px-6 py-4 bg-white hover:bg-red-50 text-red-500 border border-gray-200 hover:border-red-200 rounded-xl font-black text-xs tracking-widest transition-all whitespace-nowrap uppercase"
                                                >
                                                    Disconnect
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={handleConnectEmail}
                                                disabled={isConnecting}
                                                className="w-full sm:w-auto px-8 py-4 bg-[#15803d] hover:bg-[#114022] disabled:bg-gray-300 text-white rounded-xl font-black text-xs tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-900/10 uppercase"
                                            >
                                                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                                {isConnecting ? 'Connecting...' : 'Connect Gmail Account'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedOrder(null)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-3xl bg-white border border-gray-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#15803d] rounded-xl flex items-center justify-center text-white">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tighter">
                                Order Details
                            </h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{selectedOrder.id}</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#15803d] mb-2">Customer Info</p>
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-2">
                                <p className="font-bold text-gray-900">{selectedOrder.customer_name}</p>
                                <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>
                                <div className="pt-2">
                                     <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border ${getStatusColor(selectedOrder.status)}`}>
                                        Order {selectedOrder.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#15803d] mb-2">Order Timeline</p>
                            <div className="space-y-4 ml-2">
                                <div className="flex gap-4 relative">
                                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-100" />
                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white z-10 relative">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Order Placed</p>
                                        <p className="text-[10px] text-gray-400">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                {selectedOrder.status !== 'pending' && (
                                    <div className="flex gap-4 relative">
                                        {selectedOrder.status === 'completed' && <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-100" />}
                                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white z-10 relative">
                                            <Truck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">Dispatched</p>
                                            <p className="text-[10px] text-gray-400">Handed to carrier</p>
                                        </div>
                                    </div>
                                )}
                                {selectedOrder.status === 'completed' && (
                                    <div className="flex gap-4">
                                        <div className="w-6 h-6 rounded-full bg-[#15803d] flex items-center justify-center text-white z-10 relative">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">Order Completed</p>
                                            <p className="text-[10px] text-gray-400">Delivered successfully</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#15803d] mb-2">Order Items</p>
                        <div className="bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden">
                            <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {selectedOrder.order_items?.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                                            {item.products?.image ? (
                                                <img src={item.products.image} className="w-full h-full object-contain p-1" alt={item.products.title} />
                                            ) : (
                                                <Package className="w-6 h-6 text-gray-100" />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-xs font-bold text-gray-900 leading-tight">{item.products?.title || 'Unknown Product'}</p>
                                            <p className="text-[10px] text-gray-400">{item.quantity} x Ksh {item.price_at_sale.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-gray-900">Ksh {(item.quantity * item.price_at_sale).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-white p-6 border-t border-gray-100 flex justify-between items-center">
                                <span className="font-display font-black text-sm uppercase tracking-widest text-gray-400">Grand Total</span>
                                <span className="font-display font-black text-2xl text-[#15803d]">Ksh {selectedOrder.total_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-wrap gap-4">
                    {selectedOrder.status === 'pending' && (
                        <button 
                            disabled={isSendingEmail}
                            onClick={async () => { 
                                setIsSendingEmail(true);
                                try {
                                    await updateOrderStatus(selectedOrder.id, 'dispatched');
                                    
                                    if (emailSettings) {
                                        try {
                                            await sendDispatchReceipt(emailSettings, selectedOrder);
                                            console.log('Dispatch email sent successfully');
                                        } catch (err) {
                                            console.error('Failed to send dispatch email:', err);
                                            setNotification({ 
                                                message: 'Order updated, but receipt email failed to send. Check Gmail connection.', 
                                                type: 'error' 
                                            });
                                        }
                                    }
                                    
                                    setSelectedOrder(null);
                                } catch (error) {
                                    console.error('Failed to dispatch order:', error);
                                } finally {
                                    setIsSendingEmail(false);
                                }
                            }}
                            className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-4 rounded-2xl font-black text-sm tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isSendingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : <Truck className="w-5 h-5" />} 
                            {isSendingEmail ? 'SENDING RECEIPT...' : 'DISPATCH ORDER'}
                        </button>
                    )}
                    {selectedOrder.status === 'dispatched' && (
                        <button 
                            onClick={() => { updateOrderStatus(selectedOrder.id, 'completed'); setSelectedOrder(null); }}
                            className="flex-1 min-w-[200px] bg-[#15803d] hover:bg-[#114022] text-white py-4 rounded-2xl font-black text-sm tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                        >
                            <CheckCircle2 className="w-5 h-5" /> MARK AS COMPLETED
                        </button>
                    )}
                    <button 
                        onClick={() => setSelectedOrder(null)}
                        className="px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-black text-sm tracking-widest transition-all border border-gray-200"
                    >
                        CLOSE
                    </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setConfirmModal(null)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-md bg-white border border-gray-200 rounded-[2rem] p-8 shadow-2xl z-10"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                        <Trash2 className="w-8 h-8" />
                    </div>
                    <h3 className="font-display font-black text-2xl text-gray-900 uppercase tracking-tighter mb-2">
                        {confirmModal.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                        {confirmModal.message}
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setConfirmModal(null)}
                            className="flex-1 px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl font-black text-xs tracking-widest transition-all border border-gray-100"
                        >
                            {confirmModal.cancelText || 'CANCEL'}
                        </button>
                        <button 
                            onClick={confirmModal.onConfirm}
                            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-xs tracking-widest transition-all shadow-lg shadow-red-500/20 uppercase"
                        >
                            {confirmModal.confirmText || 'CONFIRM'}
                        </button>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#14532d] ml-1">Brand</label>
                                {!useCustomBrand ? (
                                  <div className="flex gap-2">
                                    <select
                                      required={!useCustomBrand}
                                      value={editingProduct?.brand || ''}
                                      onChange={(e) => {
                                        if (e.target.value === '__custom__') { setUseCustomBrand(true); setEditingProduct({...editingProduct!, brand: ''}); }
                                        else setEditingProduct({...editingProduct!, brand: e.target.value});
                                      }}
                                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors text-sm"
                                    >
                                      <option value="">Select brand...</option>
                                      {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                      <option value="__custom__">+ Other (type manually)</option>
                                    </select>
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      required
                                      autoFocus
                                      value={editingProduct?.brand || ''}
                                      onChange={(e) => setEditingProduct({...editingProduct!, brand: e.target.value})}
                                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors text-sm"
                                      placeholder="e.g. Natural Factors"
                                    />
                                    <button type="button" onClick={() => { setUseCustomBrand(false); setEditingProduct({...editingProduct!, brand: ''}); }} className="px-3 py-2 text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-xl">
                                      ↩
                                    </button>
                                  </div>
                                )}
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

      {/* Add Brand Modal */}
      <AnimatePresence>
        {isBrandModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBrandModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white border border-gray-200 rounded-[2rem] p-8 shadow-2xl z-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#15803d]/10 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-[#15803d]" />
                </div>
                <h3 className="font-display font-black text-xl text-gray-900 uppercase tracking-tighter">Add New Brand</h3>
                <button onClick={() => setIsBrandModalOpen(false)} className="ml-auto p-1 hover:bg-gray-100 rounded-full text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#14532d] ml-1">Brand Name</label>
                  <input
                    type="text"
                    autoFocus
                    value={newBrandName}
                    onChange={e => setNewBrandName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newBrandName.trim()) {
                          addBrand(newBrandName.trim());
                          setIsBrandModalOpen(false);
                          setNotification({ message: `Brand "${newBrandName.trim()}" added!`, type: 'success' });
                        }
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#14532d] transition-colors font-medium"
                    placeholder="e.g. Natural Factors"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsBrandModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl font-black text-xs tracking-widest border border-gray-200"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => {
                      if (!newBrandName.trim()) return;
                      addBrand(newBrandName.trim());
                      setIsBrandModalOpen(false);
                      setNotification({ message: `Brand "${newBrandName.trim()}" added!`, type: 'success' });
                    }}
                    className="flex-[2] bg-[#15803d] hover:bg-[#114022] text-white py-3 rounded-xl font-black text-sm tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> ADD BRAND
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
