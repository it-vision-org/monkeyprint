'use client';

import { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function AllProductsTheme2() {
    const router = useRouter();

    const products = Array(12).fill({
        name: "T-Shirt Circles",
        price: "50dt",
        rating: 4,
        reviews: 131
    });

    return (
        <div className="all-products-page">
            <header className="theme-2-header">
                <div className="theme-2-container">
                    <Image src="/logo.png" alt="GrabMeShoe" width={110} height={36} style={{ objectFit: 'contain' }} />
                    <button className="theme-2-cart-btn" onClick={() => router.push('/store/theme-2/cart')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="theme-2-cart-badge">1</span>
                    </button>
                </div>
            </header>

            <main className="all-products-main">
                <h1 className="all-products-title">Tous les produits</h1>

                <div className="all-products-controls">
                    <button className="all-products-btn">
                        <span>Sort</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6H13M3 12H11M3 18H13M17 8V20M17 20L13 16M17 20L21 16" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button className="all-products-btn">
                        <span>Filter</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 4H21L13 14V20L11 22V14L3 4Z" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                <div className="all-products-grid">
                    {products.map((product, index) => (
                        <div key={index} className="all-products-card" onClick={() => router.push('/store/theme-2/product/1')}>
                            <div className="all-products-image">
                                <Image src="/mock-shirt.png" alt={product.name} width={120} height={120} style={{ objectFit: 'contain' }} />
                            </div>
                            <h3 className="all-products-name">{product.name}</h3>
                            <p className="all-products-price">{product.price}</p>
                            <div className="all-products-rating">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < product.rating ? "#FFA500" : "#E5E7EB"}>
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                    </svg>
                                ))}
                                <span className="all-products-reviews">({product.reviews})</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

