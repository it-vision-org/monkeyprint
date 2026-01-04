'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import StoreHeader from '@/components/StoreHeader';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/components/types';
import type { ThemeConfig } from './themeConfig';
import { DEFAULT_SIZES } from '@/lib/constants/mockData';

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

    const products: Product[] = initialProducts.length > 0 ? initialProducts : [];

    const resetFilters = () => {
        setSelectedSize('');
        setSelectedColor('');
    };

    const getPageClassName = () => {
        const baseClass = 'all-products-page-modern';
        if (theme.id === 'theme-2') return `${baseClass} all-products-theme-2`;
        if (theme.id === 'theme-3') return `${baseClass} all-products-theme-3`;
        return `${baseClass} all-products-theme-1`;
    };

    return (
        <div className={getPageClassName()}>
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

            <main className="all-products-main-modern">
                <div className="all-products-header-modern">
                    <h1 className="all-products-title-modern">All Products</h1>
                    <p className="all-products-subtitle-modern">{products.length} products available</p>
                </div>

                <div className="all-products-toolbar-modern">
                    <div className="all-products-toolbar-left">
                        <button 
                            className="all-products-filter-btn-modern" 
                            onClick={() => setFilterOpen(true)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M3 4H21L13 14V20L11 22V14L3 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Filters</span>
                        </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <button 
                            className="all-products-sort-btn-modern" 
                            onClick={() => setSortOpen(!sortOpen)}
                        >
                            <span>Sort</span>
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none"
                                style={{ transform: sortOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                            >
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        {sortOpen && (
                            <>
                                <div className="sort-dropdown-overlay-modern" onClick={() => setSortOpen(false)}></div>
                                <div className="sort-dropdown-modern">
                                    <button 
                                        className={`sort-dropdown-item-modern ${selectedSort === 'default' ? 'selected' : ''}`}
                                        onClick={() => { setSelectedSort('default'); setSortOpen(false); }}
                                    >
                                        Default
                                    </button>
                                    <button 
                                        className={`sort-dropdown-item-modern ${selectedSort === 'price-asc' ? 'selected' : ''}`}
                                        onClick={() => { setSelectedSort('price-asc'); setSortOpen(false); }}
                                    >
                                        Price: Low to High
                                    </button>
                                    <button 
                                        className={`sort-dropdown-item-modern ${selectedSort === 'price-desc' ? 'selected' : ''}`}
                                        onClick={() => { setSelectedSort('price-desc'); setSortOpen(false); }}
                                    >
                                        Price: High to Low
                                    </button>
                                    <button 
                                        className={`sort-dropdown-item-modern ${selectedSort === 'rating' ? 'selected' : ''}`}
                                        onClick={() => { setSelectedSort('rating'); setSortOpen(false); }}
                                    >
                                        Highest Rated
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="all-products-empty-modern">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <path d="M20 7H4M20 7L18 5M20 7L18 9M4 7L6 5M4 7L6 9M6 5L5 3H19L18 5M6 9L7 21H17L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <h3>No products found</h3>
                        <p>Check back later for new products</p>
                    </div>
                ) : (
                    <div className="all-products-grid-modern">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                href={`${theme.baseRoute}/product/${product.id}`}
                                className={theme.productCardClassName}
                                imageClassName={theme.productImageClassName}
                                nameClassName={theme.productNameClassName}
                                priceClassName={theme.productPriceClassName}
                                ratingClassName={theme.productRatingClassName}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Filter Modal */}
            {filterOpen && (
                <div className="filter-modal-overlay-modern" onClick={() => setFilterOpen(false)}>
                    <div className="filter-modal-modern" onClick={(e) => e.stopPropagation()}>
                        <div className="filter-modal-header-modern">
                            <h2>Filters</h2>
                            <button className="filter-modal-close-modern" onClick={() => setFilterOpen(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>

                        <div className="filter-modal-content-modern">
                            <div className="filter-categories-modern">
                                {['TOUT', 'FEMME', 'HOMME', 'ENFANTS'].map((cat) => (
                                    <button 
                                        key={cat}
                                        className={`filter-category-tab-modern ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="filter-section-modern">
                                <button 
                                    className="filter-section-header-modern"
                                    onClick={() => setTailleExpanded(!tailleExpanded)}
                                >
                                    <span>Size</span>
                                    <svg 
                                        width="16" 
                                        height="16" 
                                        viewBox="0 0 24 24" 
                                        fill="none"
                                        style={{ transform: tailleExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                                    >
                                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                {tailleExpanded && (
                                    <div className="filter-section-content-modern">
                                        <div className="filter-size-options-modern">
                                            {sizes.map((size) => (
                                                <button
                                                    key={size}
                                                    className={`filter-size-btn-modern ${selectedSize === size ? 'selected' : ''}`}
                                                    onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="filter-section-modern">
                                <button 
                                    className="filter-section-header-modern"
                                    onClick={() => setCouleurExpanded(!couleurExpanded)}
                                >
                                    <span>Color</span>
                                    <svg 
                                        width="16" 
                                        height="16" 
                                        viewBox="0 0 24 24" 
                                        fill="none"
                                        style={{ transform: couleurExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                                    >
                                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                {couleurExpanded && (
                                    <div className="filter-section-content-modern">
                                        <div className="filter-color-options-modern">
                                            {colors.map((color) => (
                                                <button
                                                    key={color.value}
                                                    className={`filter-color-btn-modern ${selectedColor === color.value ? 'selected' : ''} ${color.value === 'white' ? 'filter-color-white-modern' : ''}`}
                                                    onClick={() => setSelectedColor(selectedColor === color.value ? '' : color.value)}
                                                    style={{ backgroundColor: color.hex }}
                                                    title={color.value}
                                                >
                                                    {selectedColor === color.value && (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="filter-modal-footer-modern">
                            <button className="filter-reset-btn-modern" onClick={resetFilters}>
                                Reset Filters
                            </button>
                            <button className="filter-apply-btn-modern" onClick={() => setFilterOpen(false)}>
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
