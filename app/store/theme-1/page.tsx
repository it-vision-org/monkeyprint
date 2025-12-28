'use client';

import { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function Theme1() {
    const router = useRouter();
    const [cartCount, setCartCount] = useState(1);

    const products = Array(6).fill({
        name: "T-Shirt Circles",
        price: "50dt",
        rating: 5,
        reviews: 131
    });

    return (
        <div className="theme-1-page">
            <header className="theme-1-header">
                <div className="theme-1-container">
                    <Image src="/logo.png" alt="GrabMeShoe" width={110} height={36} style={{ objectFit: 'contain' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button className="theme-1-cart-btn" onClick={() => router.push('/store/theme-1/cart')}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {cartCount > 0 && <span className="theme-1-cart-badge">{cartCount}</span>}
                        </button>
                    </div>
                </div>
            </header>

            <div className="theme-1-hero">
                <Image src="/T-Shirt.png" alt="Shirt" width={280} height={280} className="theme-1-hero-image" />
                <div className="theme-1-hero-content">
                    <h1 className="theme-1-hero-title">GrabMeShoe</h1>
                    <p className="theme-1-hero-text">Explore the finest clothes chez GrabMeShoe</p>
                </div>
            </div>

            <section className="theme-1-section theme-1-best-seller-section">
                <h2 className="theme-1-section-title">Best Seller</h2>
                
                <div className="theme-1-products-scroll">
                    <button className="theme-1-scroll-btn left">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="theme-1-products-grid">
                        {products.slice(0, 3).map((product, index) => (
                            <div key={index} className="theme-1-product-card" onClick={() => router.push('/store/theme-1/product/1')}>
                                <div className="theme-1-product-image">
                                    <Image src="/mock-shirt.png" alt={product.name} width={100} height={100} style={{ objectFit: 'contain' }} />
                                </div>
                                <h3 className="theme-1-product-name">{product.name}</h3>
                                <p className="theme-1-product-price">{product.price}</p>
                                <div className="theme-1-product-rating">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < product.rating ? "#FFA500" : "#E5E7EB"}>
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                        </svg>
                                    ))}
                                    <span className="theme-1-product-reviews">({product.reviews})</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="theme-1-scroll-btn right">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </section>

            <section className="theme-1-section">
                <h2 className="theme-1-section-title">Categories</h2>
                <div className="theme-1-categories">
                    <div className="theme-1-category">
                        <Image src="/Hoodie.png" alt="Woman" width={120} height={160} style={{ objectFit: 'contain' }} />
                        <span className="theme-1-category-label">Woman</span>
                    </div>
                    <div className="theme-1-category">
                        <Image src="/Hoodie.png" alt="Man" width={120} height={160} style={{ objectFit: 'contain' }} />
                        <span className="theme-1-category-label">Man</span>
                    </div>
                    <div className="theme-1-category">
                        <Image src="/Hoodie.png" alt="Kids" width={120} height={160} style={{ objectFit: 'contain' }} />
                        <span className="theme-1-category-label">Kids</span>
                    </div>
                </div>
            </section>

            <section className="theme-1-section">
                <h2 className="theme-1-section-title">Products</h2>
                <div className="theme-1-products-grid-full">
                    {products.map((product, index) => (
                        <div key={index} className="theme-1-product-card" onClick={() => router.push('/store/theme-1/product/1')}>
                            <div className="theme-1-product-image">
                                <Image src="/mock-shirt.png" alt={product.name} width={100} height={100} style={{ objectFit: 'contain' }} />
                            </div>
                            <h3 className="theme-1-product-name">{product.name}</h3>
                            <p className="theme-1-product-price">{product.price}</p>
                            <div className="theme-1-product-rating">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < product.rating ? "#FFA500" : "#E5E7EB"}>
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                    </svg>
                                ))}
                                <span className="theme-1-product-reviews">({product.reviews})</span>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="theme-1-view-all" onClick={() => router.push('/store/theme-1/all-products')}>View all</button>
            </section>
        </div>
    );
}

