'use client';

import { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function Theme3() {
    const router = useRouter();
    const [cartCount, setCartCount] = useState(1);

    const products = Array(6).fill({
        name: "T-Shirt Circles",
        price: "50dt",
        rating: 5,
        reviews: 131
    });

    return (
        <div className="theme-3-page">
            <header className="theme-3-header">
                <div className="theme-3-container">
                    <Image src="/logo.png" alt="GrabMeShoe" width={110} height={36} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button className="theme-3-cart-btn" onClick={() => router.push('/store/theme-3/cart')}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {cartCount > 0 && <span className="theme-3-cart-badge">{cartCount}</span>}
                        </button>
                    </div>
                </div>
            </header>

            <div className="theme-3-hero">
                <Image src="/T-Shirt-Design.png" alt="Pattern" width={400} height={300} className="theme-3-hero-bg-image" />
                <div className="theme-3-hero-content">
                    <h1 className="theme-3-hero-title">GrabMeShoe</h1>
                    <p className="theme-3-hero-text">Explore the finest clothes</p>
                    <p className="theme-3-hero-text">chez GrabMeShoe</p>
                </div>
            </div>

            <section className="theme-3-section">
                <h2 className="theme-3-section-title">Best Seller</h2>
                <div className="theme-3-products-scroll">
                    <button className="theme-3-scroll-btn left">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="theme-3-products-grid">
                        {products.slice(0, 3).map((product, index) => (
                            <div key={index} className="theme-3-product-card" onClick={() => router.push('/store/theme-3/product/1')}>
                                <div className="theme-3-product-image">
                                    <Image src="/mock-shirt.png" alt={product.name} width={100} height={100} style={{ objectFit: 'contain' }} />
                                </div>
                                <h3 className="theme-3-product-name">{product.name}</h3>
                                <p className="theme-3-product-price">{product.price}</p>
                                <div className="theme-3-product-rating">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < product.rating ? "#FFA500" : "#E5E7EB"}>
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                        </svg>
                                    ))}
                                    <span>({product.reviews})</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="theme-3-scroll-btn right">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </section>

            <section className="theme-3-section">
                <h2 className="theme-3-section-title">Categories</h2>
                <div className="theme-3-categories">
                    <div className="theme-3-category">
                        <Image src="/T-Shirt-Design.png" alt="Woman" width={140} height={220} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span className="theme-3-category-label">Woman</span>
                    </div>
                    <div className="theme-3-category">
                        <Image src="/T-Shirt-Design.png" alt="Man" width={140} height={220} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span className="theme-3-category-label">Man</span>
                    </div>
                    <div className="theme-3-category">
                        <Image src="/T-Shirt-Design.png" alt="Kids" width={140} height={220} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span className="theme-3-category-label">Kids</span>
                    </div>
                </div>
            </section>

            <section className="theme-3-section">
                <h2 className="theme-3-section-title">Products</h2>
                <div className="theme-3-products-grid-full">
                    {products.map((product, index) => (
                        <div key={index} className="theme-3-product-card" onClick={() => router.push('/store/theme-3/product/1')}>
                            <div className="theme-3-product-image">
                                <Image src="/mock-shirt.png" alt={product.name} width={100} height={100} style={{ objectFit: 'contain' }} />
                            </div>
                            <h3 className="theme-3-product-name">{product.name}</h3>
                            <p className="theme-3-product-price">{product.price}</p>
                            <div className="theme-3-product-rating">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < product.rating ? "#FFA500" : "#E5E7EB"}>
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                    </svg>
                                ))}
                                <span>({product.reviews})</span>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="theme-3-view-all" onClick={() => router.push('/store/theme-3/all-products')}>View all</button>
            </section>
        </div>
    );
}

