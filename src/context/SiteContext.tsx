import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

const INITIAL_HERO: HeroBanner[] = [{
    id: 1,
    titleTop: "BOOST YOUR",
    titleBottom: "DAILY HEALTH",
    subtitle: "Elevate your daily routine with our scientifically formulated, sustainably sourced supplements.",
    image: "/images/magnesium.png",
    order_index: 0
}];

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>(() => {
        const saved = localStorage.getItem('aba_products');
        return saved ? JSON.parse(saved) : [];
    });
    const [hero, setHero] = useState<HeroBanner[]>(() => {
        const saved = localStorage.getItem('aba_hero_banners');
        return saved ? JSON.parse(saved) : INITIAL_HERO;
    });
    const [orders, setOrders] = useState<Order[]>([]);
    const [inventoryBatches, setInventoryBatches] = useState<InventoryBatch[]>([]);
    const [loading, setLoading] = useState<boolean>(() => {
        // Never block if we have any cached data — show it instantly
        const hasCached = !!localStorage.getItem('aba_products');
        return !hasCached;
    });

    // Initial Fetch
    useEffect(() => {
        fetchData();
        
        // Listen for real-time changes (not hero — hero is localStorage-primary)
        const channels = [
            supabase.channel('public:products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts),
            supabase.channel('public:orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders),
            supabase.channel('public:inventory').on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_batches' }, fetchInventoryBatches),
        ];

        channels.forEach(ch => ch.subscribe());

        return () => {
            channels.forEach(ch => supabase.removeChannel(ch));
        };
    }, []);

    const fetchData = async () => {
        // Hero banners use localStorage as source of truth — load immediately
        // Never wait for Supabase for hero: RLS may block the anon key from reading
        const cachedHero = localStorage.getItem('aba_hero_banners');
        if (cachedHero) {
            try {
                const parsed = JSON.parse(cachedHero);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setHero(parsed);
                } else {
                    setHero(INITIAL_HERO);
                }
            } catch {
                setHero(INITIAL_HERO);
            }
        } else {
            // No cached banners at all — use default
            setHero(INITIAL_HERO);
            localStorage.setItem('aba_hero_banners', JSON.stringify(INITIAL_HERO));
        }

        // Products and orders are fetched from Supabase as usual
        const cachedProducts = localStorage.getItem('aba_products');
        if (cachedProducts) setProducts(JSON.parse(cachedProducts));
        setLoading(false);

        fetchProducts();
        fetchOrders();
        fetchInventoryBatches();
    };

    const fetchOrders = async () => {
        console.log('[SiteContext] Fetching orders from Supabase...');
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, products(*))')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('[SiteContext] Error fetching orders:', error);
        } else {
            console.log('[SiteContext] Orders fetched successfully:', data?.length || 0, 'orders found');
            if (data) setOrders(data);
        }
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
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching products:', error);
            const saved = localStorage.getItem('aba_products');
            if (saved) setProducts(JSON.parse(saved));
        } else if (data) {
            const mapped = data.map((p: any) => ({
                id: p.id,
                title: p.title,
                composition: p.composition,
                description: p.description || '',
                brand: p.brand,
                price: parseFloat(p.price),
                image: p.image,
                inStock: p.in_stock
            }));
            setProducts(mapped);
            localStorage.setItem('aba_products', JSON.stringify(mapped));
        }
    };

    // fetchHero is intentionally removed from the public flow.
    // Hero banners are localStorage-primary. Supabase is used as a background
    // sync target only (write path). This avoids RLS blocking public reads.
    // The admin saves banners → localStorage updated immediately → site shows them.
    const syncHeroToSupabase = async (banners: HeroBanner[]) => {
        try {
            await supabase.from('hero_banners').delete().neq('id', 0);
            const toInsert = banners.map((b, idx) => ({
                title_top: b.titleTop,
                title_bottom: b.titleBottom,
                subtitle: b.subtitle,
                image: b.image,
                link: b.link,
                order_index: idx
            }));
            await supabase.from('hero_banners').insert(toInsert);
            console.log('[SiteContext] Hero banners synced to Supabase.');
        } catch (err) {
            console.warn('[SiteContext] Could not sync banners to Supabase (this is okay):', err);
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
        if (updates.image !== undefined) dbUpdates.image = updates.image;
        if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock;

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
        const { error } = await supabase
            .from('products')
            .insert([{
                title: p.title,
                brand: p.brand,
                composition: p.composition,
                description: p.description,
                price: p.price,
                image: p.image,
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
        // PRIMARY: Save to localStorage immediately. This is instant and works regardless of Supabase RLS.
        setHero(banners);
        localStorage.setItem('aba_hero_banners', JSON.stringify(banners));
        console.log('[SiteContext] Hero banners saved to localStorage:', banners.length, 'banners');

        // SECONDARY: Try to sync to Supabase in the background (best effort)
        syncHeroToSupabase(banners);
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
