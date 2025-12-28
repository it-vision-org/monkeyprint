'use client';

import { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import PageHeader from './PageHeader';
import TopHeader from './TopHeader';
import { DEFAULT_PRODUCT_DETAIL, DEFAULT_SIZES, DEFAULT_COLORS } from '@/lib/constants/mockData';

type ProductDetailPageProps = {
    baseRoute: string;
    product?: {
        name: string;
        price: string;
        rating: number;
        reviews: number;
        description?: string;
    };
    sizes?: string[];
    colors?: string[];
    showTopHeader?: boolean;
    gradientId?: string;
};

export default function ProductDetailPage({
    baseRoute,
    product = DEFAULT_PRODUCT_DETAIL,
    sizes = DEFAULT_SIZES,
    colors = DEFAULT_COLORS,
    showTopHeader = true,
    gradientId = 'half-star-detail'
}: ProductDetailPageProps) {
    const router = useRouter();
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 !== 0;

    return (
        <div className="product-detail-page">
            {showTopHeader && (
                <TopHeader
                    cartHref={`${baseRoute}/cart`}
                    cartCount={1}
                    className="product-detail-top-header"
                    innerClassName="product-detail-top-header-inner"
                    cartButtonClassName="product-detail-top-cart-btn"
                    cartBadgeClassName="product-detail-top-cart-badge"
                />
            )}

            <PageHeader
                title="Detail du produit"
                className="product-detail-header"
                backButtonClassName="product-back-btn"
                titleClassName="product-detail-title"
            />

            <div className="product-detail-container">
                <div className="product-detail-image-container">
                    <Image src="/mock-shirt.png" alt={product.name} width={280} height={280} style={{ objectFit: 'contain' }} />
                </div>

                <div className="product-detail-info">
                    <div className="product-detail-price-row">
                        <h2 className="product-detail-price">{product.price}</h2>
                        <div className="product-detail-rating">
                            {[...Array(fullStars)].map((_, i) => (
                                <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#FFD700">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                </svg>
                            ))}
                            {hasHalfStar && (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <defs>
                                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="50%" stopColor="#FFD700" />
                                            <stop offset="50%" stopColor="#E5E7EB" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={`url(#${gradientId})`}/>
                                </svg>
                            )}
                            <span className="product-detail-reviews">({product.reviews})</span>
                        </div>
                    </div>
                    <h3 className="product-detail-name">{product.name}</h3>

                    <div className="product-detail-section">
                        <h4 className="product-detail-label">Taille</h4>
                        <div className="product-detail-sizes">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    className={`product-size-btn ${selectedSize === size ? 'active' : ''}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="product-detail-section">
                        <h4 className="product-detail-label">Couleur</h4>
                        <div className="product-detail-colors">
                            {colors.map((color, index) => (
                                <button
                                    key={index}
                                    className={`product-color-btn ${selectedColor === color ? 'active' : ''}`}
                                    style={{ 
                                        backgroundColor: color,
                                        border: color === '#FFFFFF' ? '2px solid #e5e7eb' : 'none'
                                    }}
                                    onClick={() => setSelectedColor(color)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="product-detail-section">
                        <h4 className="product-detail-label">Description</h4>
                        <p className="product-detail-description">
                            {product.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="product-detail-footer">
                <button className="product-cart-icon-btn" onClick={() => router.push(`${baseRoute}/cart`)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="product-cart-badge">1</span>
                </button>
                <button className="product-add-to-cart-btn" onClick={() => router.push(`${baseRoute}/cart`)}>
                    Commandez maintenant
                </button>
            </div>
        </div>
    );
}

