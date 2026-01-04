'use client';

import { useCart } from "@/components/CartContext";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import StoreHeader from "@/components/StoreHeader";
import type { ThemeConfig } from '@/components/themeConfig';

export default function CartPageClient({ storeSlug, theme }: { storeSlug: string; theme: ThemeConfig }) {
    const router = useRouter();
    const { items: allItems, updateQuantity, removeFromCart } = useCart();

    // Filter items by store
    const items = allItems.filter(item => item.storeSlug === storeSlug);
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = 7;
    const total = subtotal + shippingCost;

    const getPageClassName = () => {
        const baseClass = 'cart-page-modern';
        if (theme.id === 'theme-2') return `${baseClass} cart-theme-2`;
        if (theme.id === 'theme-3') return `${baseClass} cart-theme-3`;
        return `${baseClass} cart-theme-1`;
    };

    if (items.length === 0) {
        return (
            <div className={getPageClassName()}>
                <StoreHeader
                    cartCount={items.length}
                    cartHref={`${theme.baseRoute}/cart`}
                    logoFilter={theme.logoFilter}
                    className={theme.headerClassName}
                    containerClassName={theme.containerClassName}
                    cartButtonClassName={theme.cartButtonClassName}
                    cartBadgeClassName={theme.cartBadgeClassName}
                    cartStrokeColor={theme.cartStrokeColor}
                />
                <div className="cart-empty-modern">
                    <div className="cart-empty-content-modern">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <path d="M20 7H4M20 7L18 5M20 7L18 9M4 7L6 5M4 7L6 9M6 5L5 3H19L18 5M6 9L7 21H17L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <h1>Your cart is empty</h1>
                        <p>Start shopping to add items to your cart</p>
                        <Link href={theme.baseRoute} className="cart-empty-btn-modern">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={getPageClassName()}>
            <StoreHeader
                cartCount={items.length}
                cartHref={`${theme.baseRoute}/cart`}
                logoFilter={theme.logoFilter}
                className={theme.headerClassName}
                containerClassName={theme.containerClassName}
                cartButtonClassName={theme.cartButtonClassName}
                cartBadgeClassName={theme.cartBadgeClassName}
                cartStrokeColor={theme.cartStrokeColor}
            />
            <div className="cart-container-modern">
                <div className="cart-header-modern">
                    <Link href={theme.baseRoute} className="cart-back-modern">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Back</span>
                    </Link>
                    <h1 className="cart-title-modern">Shopping Cart</h1>
                    <div style={{ width: '60px' }}></div>
                </div>

                <div className="cart-content-modern">
                    {/* Cart Items */}
                    <div className="cart-items-modern">
                        {items.map(item => (
                            <div key={item.id} className="cart-item-modern">
                                <div className="cart-item-image-modern">
                                    {item.image ? (
                                        <Image 
                                            src={item.image} 
                                            alt={item.name} 
                                            width={120} 
                                            height={120}
                                            className="cart-item-img-modern"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="cart-item-placeholder-modern">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                                <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="cart-item-details-modern">
                                    <div className="cart-item-info-modern">
                                        <h3 className="cart-item-name-modern">{item.name}</h3>
                                        <p className="cart-item-store-modern">{item.storeName}</p>
                                        <p className="cart-item-price-modern">{item.price} DT</p>
                                    </div>
                                    <div className="cart-item-controls-modern">
                                        <div className="cart-item-quantity-modern">
                                            <button 
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                className="cart-quantity-btn-modern"
                                                disabled={item.quantity <= 1}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                            <span className="cart-quantity-value-modern">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="cart-quantity-btn-modern"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.id)}
                                            className="cart-item-remove-modern"
                                            aria-label="Remove item"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="cart-item-total-modern">
                                    {(item.price * item.quantity).toFixed(2)} DT
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="cart-summary-modern">
                        <h2 className="cart-summary-title-modern">Order Summary</h2>
                        <div className="cart-summary-rows-modern">
                            <div className="cart-summary-row-modern">
                                <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                                <span>{subtotal.toFixed(2)} DT</span>
                            </div>
                            <div className="cart-summary-row-modern">
                                <span>Shipping</span>
                                <span>{shippingCost} DT</span>
                            </div>
                            <div className="cart-summary-row-modern cart-summary-total-modern">
                                <span>Total</span>
                                <span>{total.toFixed(2)} DT</span>
                            </div>
                        </div>
                        <button 
                            className="cart-checkout-btn-modern"
                            onClick={() => router.push(`${theme.baseRoute}/checkout`)}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

