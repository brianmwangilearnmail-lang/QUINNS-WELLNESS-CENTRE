import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Product {
    id: number;
    title: string;
    composition: string;
    brand: string;
    price: number;
    image?: string;
    inStock: boolean;
}

export interface HeroContent {
    titleTop: string;
    titleBottom: string;
    subtitle: string;
    mainImage?: string;
}

interface SiteContextType {
    products: Product[];
    hero: HeroContent;
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
    const [products, setProducts] = useState<Product[]>([]);
    const [hero, setHero] = useState<HeroContent>(INITIAL_HERO);
    const [loading, setLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        fetchData();
        
        // Listen for real-time changes
        const productsSubscription = supabase
            .channel('public:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                fetchProducts();
            })
            .subscribe();

        const heroSubscription = supabase
            .channel('public:hero_content')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_content' }, () => {
                fetchHero();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(productsSubscription);
            supabase.removeChannel(heroSubscription);
        };
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchProducts(), fetchHero()]);
        setLoading(false);
    };

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching products:', error);
            // Fallback to localStorage if Supabase is not configured yet
            const saved = localStorage.getItem('aba_products');
            if (saved) setProducts(JSON.parse(saved));
        } else if (data) {
            // Map snake_case from DB to camelCase in App
            const mapped = data.map((p: any) => ({
                id: p.id,
                title: p.title,
                composition: p.composition,
                brand: p.brand,
                price: parseFloat(p.price),
                image: p.image,
                inStock: p.in_stock
            }));
            setProducts(mapped);
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
            setHero({
                titleTop: data.title_top,
                titleBottom: data.title_bottom,
                subtitle: data.subtitle,
                mainImage: data.main_image
            });
        }
    };

    const updateProduct = async (id: number, updates: Partial<Product>) => {
        // Map camelCase back to snake_case for Supabase
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
        if (updates.composition !== undefined) dbUpdates.composition = updates.composition;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.image !== undefined) dbUpdates.image = updates.image;
        if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock;

        const { error } = await supabase
            .from('products')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('Error updating product:', error);
            // Fallback for demo
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
                price: p.price,
                image: p.image,
                in_stock: p.inStock
            }]);

        if (error) {
            console.error('Error adding product:', error);
            localStorage.setItem('aba_products', JSON.stringify([...products, { ...p, id: Date.now() }]));
            setProducts(prev => [...prev, { ...p, id: Date.now() }]);
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
        <SiteContext.Provider value={{ products, hero, loading, updateProduct, addProduct, deleteProduct, updateHero }}>
            {children}
        </SiteContext.Provider>
    );
};

export const useSite = () => {
    const context = useContext(SiteContext);
    if (!context) throw new Error('useSite must be used within a SiteProvider');
    return context;
};
