'use client';

import Image from "next/image";
import { useState } from "react";

export default function ProduitsPage() {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [menuOpen, setMenuOpen] = useState<number | null>(null);

    const products = Array(9).fill({
        name: "T-Shirt Circles",
        price: "50dt",
        rating: 4,
        reviews: 131,
        sold: 51
    });

    return (
        <>
            {/* Main Content */}
            <div className="produits-main">
                <div className="produits-container">
                    <div className="produits-title-row">
                        <h1 className="produits-page-title">Liste de produits</h1>
                        <button className="produits-add-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>

                    <div className="produits-grid">
                        {products.slice(0, 6).map((product, index) => (
                            <div key={index} className={`produit-card ${index === 1 ? 'selected' : ''}`}>
                                {/* Three Dots Menu */}
                                <button className="produit-menu-btn" onClick={() => setMenuOpen(menuOpen === index ? null : index)}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="5" r="2" fill="#1f2937"/>
                                        <circle cx="12" cy="12" r="2" fill="#1f2937"/>
                                        <circle cx="12" cy="19" r="2" fill="#1f2937"/>
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {menuOpen === index && (
                                    <>
                                        <div className="produit-menu-overlay" onClick={() => setMenuOpen(null)} />
                                        <div className="produit-menu-dropdown">
                                            <button className="produit-menu-item modifier">
                                                Modifier
                                            </button>
                                            <button className="produit-menu-item visibilite">
                                                Visibilité
                                            </button>
                                            <button className="produit-menu-item supprimer" onClick={() => {
                                                setMenuOpen(null);
                                                setSelectedProduct(index);
                                                setDeleteDialogOpen(true);
                                            }}>
                                                Supprimer
                                            </button>
                                        </div>
                                    </>
                                )}

                                <div className="produit-image-container">
                                    <Image src="/T-Shirt.png" alt={product.name} width={180} height={180} style={{ objectFit: 'contain' }} />
                                </div>

                                <div className="produit-info">
                                    <h3 className="produit-name">{product.name}</h3>
                                    <p className="produit-price">{product.price}</p>
                                    
                                    <div className="produit-rating">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < product.rating ? "#FFD700" : "#E5E7EB"} xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                            </svg>
                                        ))}
                                        <span className="produit-reviews">({product.reviews})</span>
                                    </div>

                                    <div className="produit-sold-badge">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                                            <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M16 21V11C16 10.4477 15.5523 10 15 10H9C8.44772 10 8 10.4477 8 11V21" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M2 7L12 2L22 7" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span>{product.sold} Vendu</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="produits-pagination">
                        <button className="produits-pagination-btn">
                            &lt; Précédent
                        </button>
                        <div className="produits-pagination-numbers">
                            <button className="produits-pagination-number">1</button>
                            <button className="produits-pagination-number active">2</button>
                            <button className="produits-pagination-number">3</button>
                        </div>
                        <button className="produits-pagination-btn">
                            Suivant &gt;
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Dialog */}
            {deleteDialogOpen && (
                <div className="delete-dialog-overlay" onClick={() => setDeleteDialogOpen(false)}>
                    <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
                        <p className="delete-dialog-text">Êtes-vous sûr de vouloir supprimer ce produit ?</p>
                        <div className="delete-dialog-actions">
                            <button className="delete-dialog-btn confirm" onClick={() => setDeleteDialogOpen(false)}>NON</button>
                            <button className="delete-dialog-btn cancel" onClick={() => setDeleteDialogOpen(false)}>OUI</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

