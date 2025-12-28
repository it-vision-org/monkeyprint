'use client';

import { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import StoreHeader from '@/components/StoreHeader';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/components/types';
import type { ThemeConfig } from './themeConfig';
import { DEFAULT_PRODUCTS, DEFAULT_SIZES } from '@/lib/constants/mockData';

type AllProductsPageProps = {
    theme: ThemeConfig;
    products?: Product[];
    sizes?: string[];
    colors?: Array<{ value: string; hex: string }>;
};

const DEFAULT_COLORS = [
    { value: 'black', hex: '#000000' },
    { value: 'white', hex: '#FFFFFF' },
    { value: 'red', hex: '#FF0000' },
    { value: 'blue', hex: '#0000FF' },
    { value: 'pink', hex: '#FFC0CB' }
];

export default function AllProductsPage({
    theme,
    products: initialProducts = [],
    sizes = DEFAULT_SIZES,
    colors = DEFAULT_COLORS
}: AllProductsPageProps) {
    const router = useRouter();
    const [sortOpen, setSortOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('TOUT');
    const [typeExpanded, setTypeExpanded] = useState(false);
    const [tailleExpanded, setTailleExpanded] = useState(false);
    const [couleurExpanded, setCouleurExpanded] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSort, setSelectedSort] = useState('default');

    const products: Product[] = initialProducts.length > 0 
        ? initialProducts 
        : Array(12).fill({
            name: DEFAULT_PRODUCTS[0].name,
            price: DEFAULT_PRODUCTS[0].price,
            rating: 4.5,
            reviews: 13
        }).map((p, idx) => ({ ...p, id: idx }));

    const resetFilters = () => {
        setSelectedSize('');
        setSelectedColor('');
    };

    return (
        <div className="all-products-page">
            <StoreHeader
                cartCount={1}
                cartHref={`${theme.baseRoute}/cart`}
                logoFilter={theme.logoFilter}
                className={theme.headerClassName}
                containerClassName={theme.containerClassName}
                cartButtonClassName={theme.cartButtonClassName}
                cartBadgeClassName={theme.cartBadgeClassName}
                cartStrokeColor={theme.cartStrokeColor}
            />

            <main className="all-products-main">
                <h1 className="all-products-title">Tous les produits</h1>

                <div className="all-products-controls">
                    <div style={{ position: 'relative' }}>
                        <button className="all-products-btn" onClick={() => setSortOpen(!sortOpen)}>
                            <span>Sort</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6H13M3 12H11M3 18H13M17 8V20M17 20L13 16M17 20L21 16" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        {sortOpen && (
                            <>
                                <div className="sort-dropdown-overlay" onClick={() => setSortOpen(false)}></div>
                                <div className="sort-dropdown">
                                    <button 
                                        className={`sort-dropdown-item ${selectedSort === 'default' ? 'selected' : ''}`}
                                        onClick={() => { setSelectedSort('default'); setSortOpen(false); }}
                                    >
                                        Par défaut
                                    </button>
                                    <button 
                                        className={`sort-dropdown-item ${selectedSort === 'price-asc' ? 'selected' : ''}`}
                                        onClick={() => { setSelectedSort('price-asc'); setSortOpen(false); }}
                                    >
                                        Prix: Croissant
                                    </button>
                                    <button 
                                        className={`sort-dropdown-item ${selectedSort === 'price-desc' ? 'selected' : ''}`}
                                        onClick={() => { setSelectedSort('price-desc'); setSortOpen(false); }}
                                    >
                                        Prix: Décroissant
                                    </button>
                                    <button 
                                        className={`sort-dropdown-item ${selectedSort === 'rating' ? 'selected' : ''}`}
                                        onClick={() => { setSelectedSort('rating'); setSortOpen(false); }}
                                    >
                                        Meilleure note
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <button className="all-products-btn" onClick={() => setFilterOpen(true)}>
                        <span>Filter</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 4H21L13 14V20L11 22V14L3 4Z" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                <div className="all-products-grid">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            href={`${theme.baseRoute}/product/${product.id}`}
                            className="all-products-card"
                            imageClassName="all-products-image"
                            nameClassName="all-products-name"
                            priceClassName="all-products-price"
                            ratingClassName="all-products-rating"
                            reviewsClassName="all-products-reviews"
                        />
                    ))}
                </div>
            </main>

            {/* Filter Modal */}
            {filterOpen && (
                <div className="filter-modal-overlay" onClick={() => setFilterOpen(false)}>
                    <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="filter-modal-close" onClick={() => setFilterOpen(false)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6L18 18" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className="filter-categories">
                            <button 
                                className={`filter-category-tab ${selectedCategory === 'TOUT' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('TOUT')}
                            >
                                TOUT
                            </button>
                            <button 
                                className={`filter-category-tab ${selectedCategory === 'FEMME' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('FEMME')}
                            >
                                FEMME
                            </button>
                            <button 
                                className={`filter-category-tab ${selectedCategory === 'HOMME' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('HOMME')}
                            >
                                HOMME
                            </button>
                            <button 
                                className={`filter-category-tab ${selectedCategory === 'ENFANTS' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('ENFANTS')}
                            >
                                ENFANTS
                            </button>
                        </div>

                        <div className="filter-divider"></div>

                        <div className="filter-section">
                            <button 
                                className="filter-section-header"
                                onClick={() => setTypeExpanded(!typeExpanded)}
                            >
                                <span>Type</span>
                                <svg 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none"
                                    style={{ transform: typeExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                                >
                                    <path d="M6 9L12 15L18 9" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                            {typeExpanded && (
                                <div className="filter-section-content">
                                    <div className="filter-option">T-shirts</div>
                                    <div className="filter-option">Hoodies</div>
                                    <div className="filter-option">Mugs</div>
                                </div>
                            )}
                        </div>

                        <div className="filter-divider"></div>

                        <div className="filter-section">
                            <button 
                                className="filter-section-header"
                                onClick={() => setTailleExpanded(!tailleExpanded)}
                            >
                                <span>Taille</span>
                                <svg 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none"
                                    style={{ transform: tailleExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                                >
                                    <path d="M6 9L12 15L18 9" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                            {tailleExpanded && (
                                <div className="filter-section-content">
                                    <div className="filter-size-options">
                                        {sizes.map((size) => (
                                            <button
                                                key={size}
                                                className={`filter-size-btn ${selectedSize === size ? 'selected' : ''}`}
                                                onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="filter-divider"></div>

                        <div className="filter-section">
                            <button 
                                className="filter-section-header"
                                onClick={() => setCouleurExpanded(!couleurExpanded)}
                            >
                                <span>Couleur</span>
                                <svg 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none"
                                    style={{ transform: couleurExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                                >
                                    <path d="M6 9L12 15L18 9" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                            {couleurExpanded && (
                                <div className="filter-section-content">
                                    <div className="filter-color-options">
                                        {colors.map((color) => (
                                            <button
                                                key={color.value}
                                                className={`filter-color-btn ${selectedColor === color.value ? 'selected' : ''} ${color.value === 'white' ? 'filter-color-white' : ''}`}
                                                onClick={() => setSelectedColor(selectedColor === color.value ? '' : color.value)}
                                                style={{ backgroundColor: color.hex }}
                                            >
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="filter-reset-btn" onClick={resetFilters}>
                            <span>Réinitialiser le filtre</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M1 4V10H7M23 20V14H17M17 14L22 9M17 14L12 9M7 10L2 15M7 10L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

