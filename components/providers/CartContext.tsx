'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type CartItem = {
    id: string; // product id
    name: string;
    price: number;
    image?: string;
    quantity: number;
    storeId: string;
    storeName: string;
    storeSlug: string;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('monkeyprint_cart');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('monkeyprint_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (newItem: CartItem) => {
        setItems(current => {
            const existing = current.find(i => i.id === newItem.id);
            if (existing) {
                return current.map(i =>
                    i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
                );
            }
            return [...current, newItem];
        });
    };

    const removeFromCart = (itemId: string) => {
        setItems(current => current.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        setItems(current =>
            quantity <= 0
                ? current.filter(i => i.id !== itemId)
                : current.map(i => i.id === itemId ? { ...i, quantity } : i)
        );
    };

    const clearCart = () => setItems([]);

    const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
}
