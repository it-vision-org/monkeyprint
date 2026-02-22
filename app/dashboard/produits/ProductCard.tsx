'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { deleteProduct } from './actions';
import { useAlert } from '@/components';

import styles from "../../styles/produits.module.css";

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        description: string | null;
        basePrice: number;
        type: string;
        previewFront: string | null;
        previewBack: string | null;
        createdAt: Date;
        _count: {
            orderItems: number;
        };
    };
    imageUrl: string | null;
}

export default function ProductCard({ product, imageUrl }: ProductCardProps) {
    const router = useRouter();
    const { showAlert } = useAlert();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteProduct(product.id);
        setIsDeleting(false);

        if (result?.error) {
            showAlert(`Erreur: ${result.error}`, 'error');
        } else {
            setShowDeleteModal(false);
            // Refresh the page to show updated product list
            router.refresh();
        }
    };

    return (
        <>
            <div className={styles.produitCard}>
                {/* Action Buttons */}
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 10,
                }}>
                    {/* Edit Button */}
                    <button
                        onClick={() => router.push(`/dashboard/product-upload?edit=${product.id}`)}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'rgba(59, 130, 246, 0.9)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 1)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.9)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Modifier le produit"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>

                    {/* Delete Button */}
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 1)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Supprimer le produit"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>

                <div className={styles.produitImageContainer}>
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            width={300}
                            height={300}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        <div style={{ width: '100%', height: 180, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Img</div>
                    )}
                </div>

                <div className={styles.produitInfo}>
                    <h3 className={styles.produitName}>{product.name}</h3>
                    <p className={styles.produitPrice}>{product.basePrice} DT</p>

                    <div className={styles.produitRating}>
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#E5E7EB" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                        ))}
                        <span className={styles.produitReviews}>(0)</span>
                    </div>

                    <div className={styles.produitSoldBadge}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                            <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 21V11C16 10.4477 15.5523 10 15 10H9C8.44772 10 8 10.4477 8 11V21" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 7L12 2L22 7" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{product._count.orderItems} Vendu</span>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className={styles.modalOverlay} onClick={() => !isDeleting && setShowDeleteModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className={styles.modalHeader}>
                            <div className={styles.modalIcon}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </div>
                            <h2 className={styles.modalTitle}>Supprimer le produit</h2>
                            <p className={styles.modalSubtitle}>Cette action est irréversible</p>
                        </div>

                        {/* Product Details */}
                        <div className={styles.modalDetails}>
                            <h3 className={styles.modalDetailsTitle}>Détails du produit à supprimer :</h3>

                            <div className={styles.productSummary}>
                                {imageUrl && (
                                    <div className={styles.modalProductImage}>
                                        <Image
                                            src={imageUrl}
                                            alt={product.name}
                                            width={100}
                                            height={100}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <p className={styles.modalProductName}>{product.name}</p>
                                    <p className={styles.modalProductPrice}>{product.basePrice} DT</p>
                                    <p className={styles.modalMeta}>Type: {product.type}</p>
                                    <p className={styles.modalMeta}>Créé le: {new Date(product.createdAt).toLocaleDateString('fr-FR')}</p>
                                    <p className={styles.modalMeta}>Vendu: {product._count.orderItems} fois</p>
                                </div>
                            </div>

                            {product.description && (
                                <div className={styles.modalDescription}>
                                    <p className={styles.modalDescriptionLabel}>Description :</p>
                                    <p className={styles.modalDescriptionText}>
                                        {product.description.length > 200
                                            ? `${product.description.substring(0, 200)}...`
                                            : product.description}
                                    </p>
                                </div>
                            )}

                            {/* Warning Box */}
                            <div className={styles.warningBox}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                <div>
                                    <p className={styles.warningTitle}>Attention</p>
                                    <p className={styles.warningText}>
                                        {product._count.orderItems > 0
                                            ? `Ce produit a été vendu ${product._count.orderItems} fois. La suppression affectera les commandes associées.`
                                            : 'Ce produit sera définitivement supprimé et ne pourra pas être récupéré.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.modalActions}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className={styles.btnCancel}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className={styles.btnDelete}
                            >
                                {isDeleting ? (
                                    <>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            border: '2px solid rgba(255, 255, 255, 0.3)',
                                            borderTopColor: 'white',
                                            borderRadius: '50%',
                                            animation: 'spin 0.6s linear infinite',
                                        }} />
                                        Suppression...
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                        Supprimer définitivement
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

