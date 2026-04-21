import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/compressImage';

export interface Product {
    id: number;
    title: string;
    composition: string;
    description: string;
    brand: string;
    price: number;
    image?: string;
    inStock: boolean;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price_at_sale: number;
    products?: Product; // For joining
}

export interface Order {
    id: number;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    status: 'pending' | 'dispatched' | 'completed' | 'refunded';
    created_at: string;
    order_items?: OrderItem[];
}

export interface InventoryBatch {
    id: string;
    productId: number;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    status: 'good' | 'expiring' | 'expired';
}

export interface HeroBanner {
    id: number;
    titleTop: string;
    titleBottom: string;
    subtitle: string;
    image: string;
    link?: string;
    order_index: number;
}

export interface AnalyticsMetric {
    value: string | number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
    label: string;
}

export interface AnalyticsData {
    operations: {
        totalRevenue: AnalyticsMetric;
        orderVolume: AnalyticsMetric;
        daysOnHand: AnalyticsMetric;
        refundRate: AnalyticsMetric;
        topSkus: Array<{ id: number; title: string; sales: number; revenue: number }>;
    };
}

interface SiteContextType {
    products: Product[];
    hero: HeroBanner[];
    analytics: AnalyticsData;
    inventoryBatches: InventoryBatch[];
    orders: Order[];
    loading: boolean;
    updateProduct: (id: number, updates: Partial<Product>) => Promise<void>;
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    updateHero: (banners: HeroBanner[]) => Promise<void>;
    createOrder: (order: Omit<Order, 'id' | 'created_at'>, items: Array<{ product_id: number, quantity: number, price_at_sale: number }>) => Promise<{ success: boolean; error?: string }>;
    updateOrderStatus: (orderId: number, status: Order['status']) => Promise<void>;
    initialLoading: boolean;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);


export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>(() => {
        const saved = localStorage.getItem('aba_products');
        return saved ? JSON.parse(saved) : [];
    });
    const [hero, setHero] = useState<HeroBanner[]>(() => {
        const saved = localStorage.getItem('aba_hero_banners');
        if (!saved) return [];
        try { 
            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed)) return [];
            // FILTER: Permanently remove the Magnesium placeholder that was stuck in user's caches
            const filtered = parsed.filter(b => 
                !b.titleTop?.includes('Magnesium') && 
                !b.image?.includes('placeholder')
            );
            return filtered;
        } catch { return []; }
    });
    const [orders, setOrders] = useState<Order[]>([]);
    const [inventoryBatches, setInventoryBatches] = useState<InventoryBatch[]>([]);
    const [loading, setLoading] = useState(false); // Legacy loading flag
    const [initialLoading, setInitialLoading] = useState(true); // Tracks first true data fetch from Supabase

    // Initial Fetch
    useEffect(() => {
        fetchData();
        
        // Listen for real-time changes
        const channels = [
            supabase.channel('public:products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts),
            supabase.channel('public:orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders),
            supabase.channel('public:inventory').on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_batches' }, fetchInventoryBatches),
            supabase.channel('public:hero_banners').on('postgres_changes', { event: '*', schema: 'public', table: 'hero_banners' }, fetchHeroBanners),
        ];

        channels.forEach(ch => ch.subscribe());

        return () => {
            channels.forEach(ch => supabase.removeChannel(ch));
        };
    }, []);

    const fetchData = async () => {
        // Hero banners use localStorage as source of truth — load immediately
        const savedHero = localStorage.getItem('aba_hero_banners');
        if (savedHero) {
            try {
                const parsed = JSON.parse(savedHero);
                if (Array.isArray(parsed)) {
                    // Re-apply filter on fresh load to be safe
                    const cleaned = parsed.filter(b => !b.titleTop?.includes('Magnesium'));
                    if (cleaned.length > 0) {
                        setHero(cleaned);
                        if (cleaned.length !== parsed.length) {
                             localStorage.setItem('aba_hero_banners', JSON.stringify(cleaned));
                        }
                    } else {
                        setHero([]);
                    }
                }
            } catch {
                setHero([]);
            }
        }

        // Show cached products immediately, then sync from Supabase in background
        const cachedProducts = localStorage.getItem('aba_products');
        if (cachedProducts) {
            try { setProducts(JSON.parse(cachedProducts)); } catch {}
        }
        setLoading(false);

        // Background sync — don't await, don't block UI
        fetchHeroBanners();
        fetchProducts().finally(() => setInitialLoading(false));
        fetchOrders();
        fetchInventoryBatches();
    };

    const fetchHeroBanners = async () => {
        try {
            const { data, error } = await supabase
                .from('hero_banners')
                .select('*')
                .order('order_index', { ascending: true });
                
            if (error) {
                console.warn('[SiteContext] Banner fetch error:', error.message);
                return;
            }

            // Supabase returned data (even if empty — empty means admin deleted all banners)
            const mapped = (data || []).map((b: any) => ({
                id: b.id,
                titleTop: b.title_top || '',
                titleBottom: b.title_bottom || '',
                subtitle: b.subtitle || '',
                image: b.image || '',
                link: b.link || '',
                order_index: b.order_index ?? 0
            }));

            setHero(mapped);
            // Update cache with fresh Supabase data (overwrites any stale Magnesium placeholder)
            localStorage.setItem('aba_hero_banners', JSON.stringify(mapped));
            console.log('[SiteContext] Banners synced from Supabase:', mapped.length, 'banners.');
        } catch (err) {
            console.warn('[SiteContext] Error in fetchHeroBanners:', err);
        }
    };

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('id,customer_name,customer_email,total_amount,status,created_at,order_items(id,order_id,product_id,quantity,price_at_sale,products(id,title,price,image))')
            .order('created_at', { ascending: false });
        if (!error && data) setOrders(data);
    };

    const fetchInventoryBatches = async () => {
        const { data, error } = await supabase.from('inventory_batches').select('*');
        if (error) console.error('Error fetching inventory:', error);
        else if (data) {
            setInventoryBatches(data.map((b: any) => ({
                id: b.id.toString(),
                productId: b.product_id,
                batchNumber: b.batch_number,
                expiryDate: b.expiry_date,
                quantity: b.remaining_quantity,
                status: b.status
            })));
        }
    };

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            // Only select fields actually used in the UI — reduces payload size
            .select('id,title,brand,composition,description,price,image,in_stock,created_at')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching products:', error);
            const saved = localStorage.getItem('aba_products');
            if (saved) setProducts(JSON.parse(saved));
        } else if (data) {
            const mapped = await Promise.all(data.map(async (p: any) => {
                let finalImage = p.image;
                
                // Self-healing database: If the image is a massive base64 string, compress it and save it back
                if (finalImage && finalImage.startsWith('data:') && Math.round(finalImage.length / 1024) > 160) {
                    try {
                        const start = Date.now();
                        finalImage = await compressImage(finalImage, 150);
                        console.log(`[SiteContext] Compressed product ${p.id} image in ${Date.now() - start}ms`);
                        
                        // Fire-and-forget sync back to Supabase to fix the database bloat forever
                        supabase.from('products').update({ image: finalImage }).eq('id', p.id).then(({error}) => {
                            if (!error) console.log(`[SiteContext] Saved optimized image for product ${p.id} to Supabase.`);
                        });
                    } catch (e) {
                        console.error('Compression failed for', p.id, e);
                    }
                }

                return {
                    id: p.id,
                    title: p.title,
                    composition: p.composition,
                    description: p.description || '',
                    brand: p.brand,
                    price: parseFloat(p.price),
                    image: finalImage,
                    inStock: p.in_stock
                };
            }));
            
            setProducts(mapped);
            localStorage.setItem('aba_products', JSON.stringify(mapped));
        }
    };

    // PRIMARY write path: Supabase is the single source of truth for cross-device sync.
    // localStorage is kept as a fast-load cache only.
    const syncHeroToSupabase = async (banners: HeroBanner[]) => {
        try {
            // 1. Clear all existing banners
            const { error: deleteError } = await supabase
                .from('hero_banners')
                .delete()
                .gte('id', 0);

            if (deleteError) {
                console.error('[SiteContext] Failed to clear hero_banners:', deleteError.message);
                return;
            }

            if (banners.length === 0) {
                console.log('[SiteContext] All banners cleared.');
                return;
            }

            // 2. Insert fresh banners with correct column names
            const toInsert = banners.map((b, idx) => ({
                title_top: b.titleTop || '',
                title_bottom: b.titleBottom || '',
                subtitle: b.subtitle || '',
                image: b.image,
                link: b.link || '',
                order_index: idx
            }));

            const { error: insertError } = await supabase
                .from('hero_banners')
                .insert(toInsert);

            if (insertError) {
                console.error('[SiteContext] Failed to insert hero_banners:', insertError.message);
            } else {
                console.log('[SiteContext] Hero banners saved to Supabase successfully.');
                // Re-fetch to confirm write and update cache with DB-assigned IDs
                fetchHeroBanners();
            }
        } catch (err) {
            console.error('[SiteContext] Error syncing banners to Supabase:', err);
        }
    };

    const calculateAnalytics = (): AnalyticsData => {
        const completedOrders = orders.filter(o => o.status === 'completed');
        const refundedOrders = orders.filter(o => o.status === 'refunded');
        
        const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
        const orderVolume = completedOrders.length;
        const refundRate = orders.length > 0 ? (refundedOrders.length / orders.length) * 100 : 0;
        
        // Mocking change percentages and trends based on small logic for now
        return {
            operations: {
                totalRevenue: { value: `Ksh ${totalRevenue.toLocaleString()}`, change: 15, trend: 'up', label: 'Net Revenue' },
                orderVolume: { value: orderVolume, change: 8, trend: 'up', label: 'Total Orders' },
                daysOnHand: { value: '42 Days', change: -5, trend: 'down', label: 'Stock Health' }, // Placeholder logic
                refundRate: { value: `${refundRate.toFixed(1)}%`, change: -0.2, trend: 'down', label: 'Refund Rate' },
                topSkus: [
                   { id: 1, title: 'Wild Alaskan Salmon Oil', sales: 45, revenue: 157500 },
                   { id: 5, title: 'Magnesium Citrate', sales: 38, revenue: 83600 },
                   { id: 7, title: 'Methylcobalamin B12', sales: 31, revenue: 37200 }
                ]
            }
        };
    };

    const updateProduct = async (id: number, updates: Partial<Product>) => {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
        if (updates.composition !== undefined) dbUpdates.composition = updates.composition;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock;
        if (updates.image !== undefined) {
             dbUpdates.image = updates.image ? await compressImage(updates.image, 150) : updates.image;
        }

        const { error } = await supabase
            .from('products')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('Error updating product:', error);
            setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        }
    };

    const addProduct = async (p: Omit<Product, 'id'>) => {
        const processedImage = p.image ? await compressImage(p.image, 150) : p.image;
        const { error } = await supabase
            .from('products')
            .insert([{
                title: p.title,
                brand: p.brand,
                composition: p.composition,
                description: p.description,
                price: p.price,
                image: processedImage,
                in_stock: p.inStock
            }]);

        if (error) {
            console.error('Error adding product:', error);
            const newId = Date.now();
            setProducts(prev => [...prev, { ...p, id: newId }]);
        }
    };

    const deleteProduct = async (id: number) => {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    const updateHero = async (banners: HeroBanner[]) => {
        // Instant local update for snappy UI on the current device
        setHero(banners);
        localStorage.setItem('aba_hero_banners', JSON.stringify(banners));
        console.log('[SiteContext] Hero banners saved locally:', banners.length, 'banners');

        // Sync to Supabase so all other devices (Android, other PCs) get the update
        await syncHeroToSupabase(banners);
    };

    const createOrder = async (order: Omit<Order, 'id' | 'created_at'>, items: Array<{ product_id: number, quantity: number, price_at_sale: number }>) => {
        try {
            console.log('[SiteContext] createOrder called with:', { order, itemsCount: items.length });
            
            const { data, error } = await supabase
                .from('orders')
                .insert([{
                    customer_name: order.customer_name,
                    customer_email: order.customer_email,
                    total_amount: order.total_amount,
                    status: 'pending'
                }])
                .select();

            if (error) {
                console.error('[SiteContext] Supabase: Orders insert error:', error);
                throw error;
            }
            if (!data || data.length === 0) {
                console.error('[SiteContext] Supabase: No data returned after order insert');
                throw new Error('No data returned from order creation');
            }

            const orderId = data[0].id;
            console.log('[SiteContext] Order header created. ID:', orderId);

            const orderItems = items.map(item => ({
                order_id: orderId,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_sale: item.price_at_sale
            }));

            console.log('[SiteContext] Inserting order items...', orderItems);
            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                console.error('[SiteContext] Supabase: Order items insert error:', itemsError);
                throw itemsError;
            }

            console.log('[SiteContext] Order process complete. Re-fetching orders...');
            await fetchOrders(); // Force immediate refresh
            return { success: true };
        } catch (error: any) {
            console.error('[SiteContext] createOrder exception:', error);
            return { success: false, error: error.message || 'Unknown database error' };
        }
    };

    const updateOrderStatus = async (orderId: number, status: Order['status']) => {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order status:', error);
        } else {
            fetchOrders(); // Refresh orders
        }
    };

    return (
        <SiteContext.Provider value={{ 
            products, 
            hero, 
            analytics: calculateAnalytics(), 
            inventoryBatches, 
            orders,
            loading,
            initialLoading, 
            updateProduct, 
            addProduct, 
            deleteProduct, 
            updateHero,
            createOrder,
            updateOrderStatus
        }}>
            {children}
        </SiteContext.Provider>
    );
};

export const useSite = () => {
    const context = useContext(SiteContext);
    if (!context) throw new Error('useSite must be used within a SiteProvider');
    return context;
};
