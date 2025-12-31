'use client';

import Image from "next/image";
import { useState } from "react";

type CartItem = {
    label: string;
    price: number;
    icon?: React.ReactNode;
};

type ProductUploadHeaderProps = {
    totalPrice: number;
    cartItems?: CartItem[];
    showPriceDetails?: boolean;
};

const BASE_PRICE = 20;
const DESIGN_FEE = 30;

export default function ProductUploadHeader({
    totalPrice,
    cartItems,
    showPriceDetails = true
}: ProductUploadHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [priceExpanded, setPriceExpanded] = useState(false);

    // Default cart items if not provided
    const defaultCartItems: CartItem[] = cartItems || [
        {
            label: "Articles (T-shirt)",
            price: BASE_PRICE,
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
            ),
        },
        {
            label: "Design",
            price: DESIGN_FEE,
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
            ),
        },
    ];

    return (
        <>
            <header className="pu-header">
                <div className="pu-header-inner">
                    <div className="pu-logo-container">
                        <Image src="/logo.png" alt="Monkey Print" width={84} height={42} />
                        <span className="pu-logo-text">MONKEY PRINT</span>
                    </div>
                    <nav className="pu-desktop-nav">
                        <a href="/" className="pu-desktop-nav-link">Accueil</a>
                        <a href="#" className="pu-desktop-nav-link">Shop List</a>
                        <a href="#" className="pu-desktop-nav-link">Contactez-nous</a>
                    </nav>
                    <button
                        className="pu-menu-trigger"
                        type="button"
                        aria-label="Ouvrir le menu"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className="pu-menu-line"></span>
                        <span className="pu-menu-line"></span>
                        <span className="pu-menu-line"></span>
                    </button>
                </div>
                <div className="pu-cart-container">
                    <button
                        className="pu-cart-bar"
                        type="button"
                        aria-expanded={priceExpanded}
                        onClick={() => showPriceDetails && setPriceExpanded((prev) => !prev)}
                    >
                        <div className="pu-cart-content">
                            <svg
                                className="pu-cart-icon"
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" />
                            </svg>
                        </div>
                        <div className="pu-cart-total">
                            <span className="pu-cart-price">{totalPrice}DT</span>
                            {showPriceDetails && (
                                <svg
                                    width="16"
                                    height="10"
                                    viewBox="0 0 16 10"
                                    fill="none"
                                    className={priceExpanded ? "expanded" : ""}
                                >
                                    <path d="M1 1L8 8L15 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                    </button>
                    {showPriceDetails && priceExpanded && (
                        <div className="pu-cart-details">
                            <div className="pu-cart-details-header">
                                <h3 className="pu-cart-details-title">Détails du prix</h3>
                            </div>
                            <div className="pu-cart-items">
                                {defaultCartItems.map((item, index) => (
                                    <div key={index} className="pu-cart-item">
                                        <div className="pu-cart-item-info">
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </div>
                                        <span className="pu-cart-item-price">{item.price}DT</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pu-cart-total-line">
                                <span className="pu-cart-total-label">Total</span>
                                <span className="pu-cart-total-price">{totalPrice}DT</span>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {mobileMenuOpen && (
                <div className="mp-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
                    <div className="pu-mobile-sheet" onClick={(event) => event.stopPropagation()}>
                        <button className="pu-mobile-close" type="button" onClick={() => setMobileMenuOpen(false)}>
                            ×
                        </button>
                        <nav className="pu-mobile-menu">
                            <a href="/">Accueil</a>
                            <a href="#">Shop List</a>
                            <a href="#">Contactez-nous</a>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}

