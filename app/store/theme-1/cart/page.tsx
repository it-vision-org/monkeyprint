'use client';

import { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';

interface CartItemSize {
    size: string;
    quantity: number;
}

interface CartItem {
    id: number;
    name: string;
    price: number;
    sizes: CartItemSize[];
}

export default function Cart() {
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([
        { 
            id: 1, 
            name: "T-Shirt Circles", 
            price: 50, 
            sizes: [
                { size: 'L', quantity: 10 },
                { size: 'S', quantity: 22 },
                { size: 'M', quantity: 5 }
            ]
        },
        { 
            id: 2, 
            name: "T-Shirt Circles", 
            price: 50, 
            sizes: [
                { size: 'S', quantity: 1 }
            ]
        }
    ]);

    const updateQuantity = (itemId: number, sizeIndex: number, delta: number) => {
        setItems(items.map(item => {
            if (item.id === itemId) {
                const newSizes = [...item.sizes];
                newSizes[sizeIndex] = {
                    ...newSizes[sizeIndex],
                    quantity: Math.max(1, newSizes[sizeIndex].quantity + delta)
                };
                return { ...item, sizes: newSizes };
            }
            return item;
        }));
    };

    const removeSize = (itemId: number, sizeIndex: number) => {
        setItems(items.map(item => {
            if (item.id === itemId) {
                const newSizes = item.sizes.filter((_, idx) => idx !== sizeIndex);
                if (newSizes.length === 0) {
                    return null;
                }
                return { ...item, sizes: newSizes };
            }
            return item;
        }).filter(Boolean) as CartItem[]);
    };

    const removeItem = (itemId: number) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    const getItemSubtotal = (item: CartItem) => {
        return item.sizes.reduce((sum, size) => sum + (item.price * size.quantity), 0);
    };

    const subtotal = items.reduce((sum, item) => sum + getItemSubtotal(item), 0);
    const shipping = 9;
    const total = subtotal + shipping;
    const totalItems = items.reduce((sum, item) => sum + item.sizes.length, 0);

    return (
        <div className="cart-page">
            <header className="cart-top-header">
                <div className="cart-top-header-inner">
                    <Image src="/logo.png" alt="GrabMeShoe" width={110} height={36} style={{ objectFit: 'contain' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button className="cart-top-cart-btn" onClick={() => router.push('/store/theme-1/cart')}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="cart-top-cart-badge">1</span>
                        </button>
                        <button className="cart-top-menu-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 6H20M4 12H20M4 18H20" stroke="#1f2937" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <header className="cart-header">
                <button className="cart-back-btn" onClick={() => router.back()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2"/>
                    </svg>
                </button>
                <h1 className="cart-title">Votre panier</h1>
                <div style={{ width: '24px' }}></div>
            </header>

            <div className="cart-container">
                <div className="cart-items">
                    {items.map((item) => (
                        <div key={item.id} className="cart-item">
                            <div className="cart-item-image">
                                <Image src="/mock-shirt.png" alt={item.name} width={80} height={80} />
                            </div>
                            <div className="cart-item-details">
                                <h3 className="cart-item-name">{item.name}</h3>
                                <div className="cart-item-rating">
                                    {[...Array(4)].map((_, i) => (
                                        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFD700">
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                        </svg>
                                    ))}
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <defs>
                                            <linearGradient id="half-star-cart" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="50%" stopColor="#FFD700" />
                                                <stop offset="50%" stopColor="#E5E7EB" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#half-star-cart)"/>
                                    </svg>
                                </div>
                                <p className="cart-item-price">{item.price}dt</p>

                                <div className="cart-item-sizes">
                                    {item.sizes.map((sizeItem, sizeIndex) => (
                                        <div key={sizeIndex} className="cart-item-size-row">
                                            <div className="cart-item-quantity">
                                                <button onClick={() => updateQuantity(item.id, sizeIndex, -1)}>-</button>
                                                <span>{sizeItem.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, sizeIndex, 1)}>+</button>
                                            </div>
                                            <div className="cart-item-size-badge">{sizeItem.size}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="cart-item-footer">
                                    <span className="cart-item-qty-label">Qty: ({item.sizes.reduce((sum, s) => sum + s.quantity, 0)})</span>
                                    <div className="cart-item-footer-right">
                                        <span className="cart-item-subtotal">{getItemSubtotal(item)}DT</span>
                                        <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <div className="cart-summary-row">
                        <span>Articles ({totalItems})</span>
                        <span>{subtotal}DT</span>
                    </div>
                    <div className="cart-summary-row">
                        <span>Livraison</span>
                        <span>{shipping}DT</span>
                    </div>
                    <div className="cart-summary-row cart-summary-total">
                        <span>Totale</span>
                        <span>{total}DT</span>
                    </div>
                </div>

                <button className="cart-checkout-btn" onClick={() => router.push('/store/theme-1/checkout')}>
                    Commandez maintenant
                </button>
            </div>
        </div>
    );
}



