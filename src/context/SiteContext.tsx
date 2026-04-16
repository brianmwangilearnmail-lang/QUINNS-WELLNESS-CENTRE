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

export interface Order {
    id: number;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
}

export interface InventoryBatch {
    id: string;
    productId: number;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    status: 'good' | 'expiring' | 'expired';
}

export interface HeroContent {
    titleTop: string;
    titleBottom: string;
    subtitle: string;
    mainImage?: string;
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
    hero: HeroContent;
    analytics: AnalyticsData;
    inventoryBatches: InventoryBatch[];
    orders: Order[];
    loading: boolean;
    updateProduct: (id: number, updates: Partial<Product>) => Promise<void>;
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    updateHero: (updates: Partial<HeroContent>) => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

const INITIAL_HERO: HeroContent = {
    titleTop: "BOOST YOUR",
    titleBottom: "DAILY HEALTH",
    subtitle: "Elevate your daily routine with our scientifically formulated, sustainably sourced supplements.",
    mainImage: "/images/magnesium.png",
};

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>(() => {
        const saved = localStorage.getItem('aba_products');
        return saved ? JSON.parse(saved) : [];
    });
    const [hero, setHero] = useState<HeroContent>(() => {
        const saved = localStorage.getItem('aba_hero');
        return saved ? JSON.parse(saved) : INITIAL_HERO;
    });
    const [orders, setOrders] = useState<Order[]>([]);
    const [inventoryBatches, setInventoryBatches] = useState<InventoryBatch[]>([]);
    const [loading, setLoading] = useState<boolean>(() => {
        const hasCachedProducts = !!localStorage.getItem('aba_products');
        return !hasCachedProducts; // Only show loading if we don't have a cache
    });

    // Initial Fetch
    useEffect(() => {
        fetchData();
        
        // Listen for real-time changes
        const channels = [
            supabase.channel('public:products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts),
            supabase.channel('public:orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders),
            supabase.channel('public:inventory').on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_batches' }, fetchInventoryBatches),
            supabase.channel('public:hero').on('postgres_changes', { event: '*', schema: 'public', table: 'hero_content' }, fetchHero)
        ];

        channels.forEach(ch => ch.subscribe());

        return () => {
            channels.forEach(ch => supabase.removeChannel(ch));
        };
    }, []);

    const fetchData = async () => {
        // Parallel fetch for crucial user-facing data to update cache behind the scenes
        await Promise.all([fetchProducts(), fetchHero()]);
        
        setLoading(false); // Unblock UI if it wasn't unblocked already

        // Fetch non-critical admin data in the background silently
        fetchOrders();
        fetchInventoryBatches();
    };

    const fetchOrders = async () => {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) console.error('Error fetching orders:', error);
        else if (data) setOrders(data);
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

    const fetchHero = async () => {
        const { data, error } = await supabase
            .from('hero_content')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            console.error('Error fetching hero:', error);
             const saved = localStorage.getItem('aba_hero');
             if (saved) setHero(JSON.parse(saved));
        } else if (data) {
            const newHero = {
                titleTop: data.title_top,
                titleBottom: data.title_bottom,
                subtitle: data.subtitle,
                mainImage: data.main_image
            };
            setHero(newHero);
            localStorage.setItem('aba_hero', JSON.stringify(newHero));
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

    const updateHero = async (updates: Partial<HeroContent>) => {
        const dbUpdates: any = {};
        if (updates.titleTop !== undefined) dbUpdates.title_top = updates.titleTop;
        if (updates.titleBottom !== undefined) dbUpdates.title_bottom = updates.titleBottom;
        if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
        if (updates.mainImage !== undefined) dbUpdates.main_image = updates.mainImage;

        const { error } = await supabase
            .from('hero_content')
            .update(dbUpdates)
            .eq('id', 1);

        if (error) {
            console.error('Error updating hero:', error);
            setHero(prev => ({ ...prev, ...updates }));
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
            updateHero 
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
