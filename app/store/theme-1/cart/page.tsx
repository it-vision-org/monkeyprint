'use client';

import { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function Cart() {
    const router = useRouter();
    const [items, setItems] = useState([
        { id: 1, name: "T-Shirt Circles", price: 50, size: 'L', quantity: 10, color: 'Black' },
        { id: 2, name: "T-Shirt Circles", price: 50, size: 'S', quantity: 1, color: 'Red' }
    ]);

    const updateQuantity = (id: number, delta: number) => {
        setItems(items.map(item => 
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 9;
    const total = subtotal + shipping;

    return (
        <div className="cart-page">
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
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < 4 ? "#FFA500" : "#E5E7EB"}>
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                        </svg>
                                    ))}
                                </div>
                                <p className="cart-item-price">{item.price}dt</p>

                                <div className="cart-item-controls">
                                    <div className="cart-item-quantity">
                                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                    </div>
                                    <div className="cart-item-size">{item.size}</div>
                                </div>

                                <div className="cart-item-footer">
                                    <span className="cart-item-qty-label">Qty: ({item.quantity})</span>
                                    <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <div className="cart-summary-row">
                        <span>Articles ({items.length})</span>
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

