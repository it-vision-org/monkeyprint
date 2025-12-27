'use client';

import { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function AllProductsTheme2() {
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

    const products = Array(12).fill({
        name: "T-Shirt Circles",
        price: "50dt",
        rating: 4,
        reviews: 131
    });

    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const colors = [
        { value: 'black', hex: '#000000' },
        { value: 'white', hex: '#FFFFFF' },
        { value: 'red', hex: '#FF0000' },
        { value: 'blue', hex: '#0000FF' },
        { value: 'pink', hex: '#FFC0CB' }
    ];

    const resetFilters = () => {
        setSelectedSize('');
        setSelectedColor('');
    };

    return (
        <div className="all-products-page">
            <header className="theme-2-header">
                <div className="theme-2-container">
                    <Image src="/logo.png" alt="GrabMeShoe" width={110} height={36} style={{ objectFit: 'contain' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button className="theme-2-cart-btn" onClick={() => router.push('/store/theme-2/cart')}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="theme-2-cart-badge">1</span>
                        </button>
                        <button className="theme-2-menu-btn" onClick={() => router.push('/store/theme-2')}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 6H20M4 12H20M4 18H20" stroke="#1f2937" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

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
