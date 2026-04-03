import React, { useState, useRef } from 'react';
import { LayoutDashboard, Plus, Trash2, Edit2, LogOut, Package, Image as ImageIcon, Layout, Save, X, Check, Upload, CloudUpload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite, Product } from '../context/SiteContext';

interface AdminDashboardPageProps {
  onLogout: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onLogout }) => {
  const { products, hero, updateHero, updateProduct, addProduct, deleteProduct } = useSite();
  const [activeTab, setActiveTab] = useState<'hero' | 'products'>('hero');
  
  // Hero form state
  const [heroForm, setHeroForm] = useState(hero);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  // Product Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

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

    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large (max 2MB). Please use an optimized image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingProduct({
      title: '',
      composition: '',
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#ccff00] rounded-xl flex items-center justify-center text-black">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-black text-3xl text-white uppercase tracking-tighter">CMS Dashboard</h1>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Logged in as ABA_HEALTH</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="px-6 py-2 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/10 hover:border-red-500/50 rounded-xl transition-all flex items-center gap-2 font-bold text-sm"
          >
            <LogOut className="w-4 h-4" /> LOG OUT
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <div className="lg:col-span-1 space-y-4">
            <button 
              onClick={() => setActiveTab('hero')}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 font-black tracking-widest text-sm uppercase ${activeTab === 'hero' ? 'bg-[#ccff00] text-black border-[#ccff00]' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}`}
            >
              <Layout className="w-5 h-5" /> Hero Section
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 font-black tracking-widest text-sm uppercase ${activeTab === 'products' ? 'bg-[#ccff00] text-black border-[#ccff00]' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}`}
            >
              <Package className="w-5 h-5" /> Product Catalog
            </button>
          </div>

          {/* Main Controls */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'hero' ? (
                <motion.div 
                  key="hero-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <Layout className="w-6 h-6 text-[#ccff00]" />
                        <h2 className="font-display font-black text-2xl text-white uppercase tracking-tighter">Hero Section Settings</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6 text-left">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Main Heading (Top)</label>
                                <input 
                                    type="text" 
                                    value={heroForm.titleTop}
                                    onChange={(e) => setHeroForm({...heroForm, titleTop: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Main Heading (Bottom)</label>
                                <input 
                                    type="text" 
                                    value={heroForm.titleBottom}
                                    onChange={(e) => setHeroForm({...heroForm, titleBottom: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Hero Subtitle</label>
                            <textarea 
                                rows={3}
                                value={heroForm.subtitle}
                                onChange={(e) => setHeroForm({...heroForm, subtitle: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors resize-none text-sm" 
                            />
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <ImageIcon className="w-5 h-5 text-[#ff5e00]" />
                                <h3 className="font-bold text-white uppercase tracking-wider text-sm">Visual Preview</h3>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="w-32 h-40 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden group relative">
                                     {heroForm.mainImage ? (
                                        <img src={heroForm.mainImage} className="w-full h-full object-contain p-2" alt="Hero" />
                                     ) : (
                                        <ImageIcon className="w-10 h-10 text-white/10" />
                                     )}
                                     <div 
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                        onClick={() => heroFileInputRef.current?.click()}
                                     >
                                         <Upload className="w-8 h-8 text-[#ccff00]" />
                                     </div>
                                </div>
                                <div className="space-y-4 flex-grow text-left">
                                    <p className="text-white/60 text-xs">Recommended: High-resolution supplement photos with transparent backgrounds.</p>
                                    <input 
                                        type="file" 
                                        ref={heroFileInputRef}
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, (base64) => setHeroForm({...heroForm, mainImage: base64}))}
                                    />
                                    <button 
                                      className="px-6 py-2 bg-[#ccff00]/10 hover:bg-[#ccff00]/20 text-[#ccff00] rounded-lg text-sm font-black tracking-widest transition-all border border-[#ccff00]/20"
                                      onClick={() => heroFileInputRef.current?.click()}
                                    >
                                        UPLOAD NEW IMAGE
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                          onClick={handleHeroSave}
                          className="w-full bg-[#ccff00] hover:bg-[#b3e600] text-black py-4 rounded-xl font-black text-lg tracking-widest transition-all hover:shadow-[0_10px_30px_rgba(204,255,0,0.4)] flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                        >
                            <Save className="w-6 h-6" /> SAVE HERO CHANGES
                        </button>
                    </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="products-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <Package className="w-6 h-6 text-[#ccff00]" />
                                <h2 className="font-display font-black text-2xl text-white uppercase tracking-tighter">Product Management</h2>
                            </div>
                            <button 
                              onClick={openAddModal}
                              className="px-6 py-2 bg-[#ff5e00] hover:bg-[#e05300] text-white rounded-xl font-black text-xs tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
                            >
                                <Plus className="w-4 h-4" /> ADD NEW
                            </button>
                        </div>

                        <div className="overflow-x-auto text-left">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#ccff00]">Product Info</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#ccff00]">Price</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#ccff00]">Status</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#ccff00] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {product.image ? (
                                                            <img src={product.image} className="w-full h-full object-contain p-1" alt={product.title} />
                                                        ) : (
                                                            <Package className="w-5 h-5 text-white/20" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm leading-tight">{product.title}</p>
                                                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-tighter">{product.brand}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-white font-black text-sm">
                                                Ksh {product.price.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4">
                                                <button 
                                                    onClick={() => handleToggleProductStatus(product.id, product.inStock)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${product.inStock ? 'bg-[#ccff00] text-black' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}
                                                >
                                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                                </button>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                      onClick={() => openEditModal(product)}
                                                      className="p-2 hover:bg-[#ccff00] hover:text-black rounded-lg text-white transition-all"
                                                    >
                                                      <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                      onClick={() => { if(window.confirm('Delete this product?')) deleteProduct(product.id); }}
                                                      className="p-2 hover:bg-red-500 hover:text-white rounded-lg text-white transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

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
              className="relative w-full max-w-2xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#ccff00] rounded-xl flex items-center justify-center text-black">
                    {modalMode === 'add' ? <Plus className="w-6 h-6" /> : <Edit2 className="w-6 h-6" />}
                  </div>
                  <h2 className="font-display font-black text-2xl text-white uppercase tracking-tighter">
                    {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
                  </h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8 mb-4">
                    {/* Image Upload Area */}
                    <div className="w-full md:w-1/3 flex flex-col gap-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#ccff00] ml-1">Product Photo</label>
                        <div 
                            className="aspect-square bg-black/40 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-[#ccff00]/50 transition-colors overflow-hidden relative"
                            onClick={() => productFileInputRef.current?.click()}
                        >
                            {editingProduct?.image ? (
                                <>
                                    <img src={editingProduct.image} className="w-full h-full object-contain p-4" alt="Preview" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <CloudUpload className="w-10 h-10 text-[#ccff00]" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <CloudUpload className="w-6 h-6 text-white/40 group-hover:text-[#ccff00]" />
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-white font-bold text-xs">Click to upload</p>
                                        <p className="text-white/30 text-[10px] mt-1 uppercase tracking-tighter">PNG, JPG up to 2MB</p>
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
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#ccff00] ml-1">Product Title</label>
                            <input 
                                type="text" 
                                required
                                value={editingProduct?.title || ''}
                                onChange={(e) => setEditingProduct({...editingProduct!, title: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors font-medium" 
                                placeholder="e.g. Omega-3 Fish Oil"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#ccff00] ml-1">Brand Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={editingProduct?.brand || ''}
                                    onChange={(e) => setEditingProduct({...editingProduct!, brand: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors text-sm" 
                                    placeholder="e.g. Natural Factors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#ccff00] ml-1">Price (KSh)</label>
                                <input 
                                    type="number" 
                                    required
                                    value={editingProduct?.price || ''}
                                    onChange={(e) => setEditingProduct({...editingProduct!, price: Number(e.target.value)})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors text-sm" 
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#ccff00] ml-1">Composition / Description</label>
                            <textarea 
                                rows={3}
                                required
                                value={editingProduct?.composition || ''}
                                onChange={(e) => setEditingProduct({...editingProduct!, composition: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors resize-none text-sm" 
                                placeholder="e.g. Contains high potency EPA/DHA..."
                            />
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#ccff00] ml-1">Manual Image URL (Optional)</label>
                        <input 
                            type="text" 
                            value={editingProduct?.image || ''}
                            onChange={(e) => setEditingProduct({...editingProduct!, image: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors text-xs" 
                            placeholder="/images/product.png"
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer h-[50px] mb-[2px]" onClick={() => setEditingProduct({...editingProduct!, inStock: !editingProduct?.inStock})}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${editingProduct?.inStock ? 'bg-[#ccff00] border-[#ccff00]' : 'border-white/20'}`}>
                            {editingProduct?.inStock && <Check className="w-4 h-4 text-black" />}
                        </div>
                        <span className="text-white font-bold text-[10px] tracking-wider uppercase">In Stock</span>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-xs tracking-widest transition-all border border-white/10"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-[#ccff00] hover:bg-[#b3e600] text-black py-4 rounded-xl font-black text-lg tracking-widest transition-all hover:shadow-[0_10px_30px_rgba(204,255,0,0.4)] flex items-center justify-center gap-3 active:scale-95 shadow-xl"
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
