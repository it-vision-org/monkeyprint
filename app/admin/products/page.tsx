'use client';

import Image from "next/image";
import { useState } from "react";

export default function AdminProductsPage() {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const products = [
        { id: 1, name: "T-Shirt Circles", store: "FashionStore", price: "50 DT", sold: 234, stock: 45, rating: 4.5, status: "active" },
        { id: 2, name: "Hoodie Classic", store: "StyleZone", price: "89 DT", sold: 156, stock: 23, rating: 4.8, status: "active" },
        { id: 3, name: "Design T-Shirt", store: "TrendShop", price: "67 DT", sold: 412, stock: 89, rating: 4.2, status: "active" },
        { id: 4, name: "Premium Hoodie", store: "DesignCo", price: "120 DT", sold: 89, stock: 12, rating: 4.9, status: "active" },
        { id: 5, name: "Basic T-Shirt", store: "EcoFashion", price: "45 DT", sold: 567, stock: 234, rating: 4.0, status: "active" },
        { id: 6, name: "Sport T-Shirt", store: "VintageVibes", price: "55 DT", sold: 321, stock: 67, rating: 4.6, status: "active" },
        { id: 7, name: "Limited Edition", store: "FashionStore", price: "150 DT", sold: 45, stock: 8, rating: 5.0, status: "active" },
        { id: 8, name: "Casual T-Shirt", store: "TrendShop", price: "48 DT", sold: 278, stock: 56, rating: 4.3, status: "active" },
    ];

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.store.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="admin-products-header">
                <h1 className="dash-page-title">Gestion des Produits</h1>
                <div className="admin-products-actions">
                    <button className="admin-export-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Exporter
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-products-stats">
                <div className="admin-products-stat-card">
                    <div className="admin-products-stat-value">{products.length}</div>
                    <div className="admin-products-stat-label">Total Produits</div>
                </div>
                <div className="admin-products-stat-card">
                    <div className="admin-products-stat-value">{products.reduce((sum, p) => sum + p.sold, 0).toLocaleString()}</div>
                    <div className="admin-products-stat-label">Produits Vendus</div>
                </div>
                <div className="admin-products-stat-card">
                    <div className="admin-products-stat-value">{products.reduce((sum, p) => sum + p.stock, 0).toLocaleString()}</div>
                    <div className="admin-products-stat-label">Stock Total</div>
                </div>
            </div>

            {/* Search */}
            <div className="admin-products-filters">
                <div className="admin-search-bar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Rechercher par nom ou magasin..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Products Grid */}
            <div className="admin-products-grid">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="admin-product-card">
                        <div className="admin-product-image">
                            <Image src="/T-Shirt.png" alt={product.name} width={200} height={200} style={{ objectFit: 'contain' }} />
                        </div>
                        <div className="admin-product-info">
                            <div className="admin-product-name">{product.name}</div>
                            <div className="admin-product-store">{product.store}</div>
                            <div className="admin-product-price">{product.price}</div>
                            <div className="admin-product-stats">
                                <span>Vendu: {product.sold}</span>
                                <span>Stock: {product.stock}</span>
                            </div>
                            <div className="admin-product-rating">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.floor(product.rating) ? "#FFD700" : "#E5E7EB"} xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                    </svg>
                                ))}
                                <span>{product.rating}</span>
                            </div>
                            <div className="admin-product-actions">
                                <button className="admin-product-action-btn view">Voir</button>
                                <button 
                                    className="admin-product-action-btn delete"
                                    onClick={() => {
                                        setSelectedProduct(product.id);
                                        setDeleteDialogOpen(true);
                                    }}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="admin-pagination">
                <button className="admin-pagination-btn">
                    &lt; Précédent
                </button>
                <div className="admin-pagination-numbers">
                    <button className="admin-pagination-number active">1</button>
                    <button className="admin-pagination-number">2</button>
                </div>
                <button className="admin-pagination-btn">
                    Suivant &gt;
                </button>
            </div>

            {/* Delete Dialog */}
            {deleteDialogOpen && (
                <div className="delete-dialog-overlay" onClick={() => setDeleteDialogOpen(false)}>
                    <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
                        <p className="delete-dialog-text">Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.</p>
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

