'use client';

import { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import PageHeader from './PageHeader';
import TopHeader from './TopHeader';

interface CartItemSize {
    size: string;
    quantity: number;
}

export interface CartItem {
    id: number;
    name: string;
    price: number;
    sizes: CartItemSize[];
}

type CartPageProps = {
    baseRoute: string;
    initialItems?: CartItem[];
    shippingCost?: number;
    gradientId?: string;
};

export default function CartPage({
    baseRoute,
    initialItems = [],
    shippingCost = 9,
    gradientId = 'half-star-cart'
}: CartPageProps) {
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>(initialItems);

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
    const shipping = shippingCost;
    const total = subtotal + shipping;
    const totalItems = items.reduce((sum, item) => sum + item.sizes.length, 0);

    return (
        <div className="cart-page">
            <TopHeader
                cartHref={`${baseRoute}/cart`}
                cartCount={1}
                className="cart-top-header"
                innerClassName="cart-top-header-inner"
                cartButtonClassName="cart-top-cart-btn"
                cartBadgeClassName="cart-top-cart-badge"
            />

            <PageHeader
                title="Votre panier"
                className="cart-header"
                backButtonClassName="cart-back-btn"
                titleClassName="cart-title"
            />

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
                                            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="50%" stopColor="#FFD700" />
                                                <stop offset="50%" stopColor="#E5E7EB" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={`url(#${gradientId})`}/>
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

                <button className="cart-checkout-btn" onClick={() => router.push(`${baseRoute}/checkout`)}>
                    Commandez maintenant
                </button>
            </div>
        </div>
    );
}

