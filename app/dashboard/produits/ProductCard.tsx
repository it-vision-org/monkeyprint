'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProduct } from './actions';

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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteProduct(product.id);
        setIsDeleting(false);

        if (result?.error) {
            alert(`Erreur: ${result.error}`);
        } else {
            setShowDeleteModal(false);
            // Refresh the page to show updated product list
            router.refresh();
        }
    };

    return (
        <>
            <div className="produit-card" style={{ position: 'relative' }}>
                {/* Delete Button */}
                <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
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
                        zIndex: 10,
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

                <div className="produit-image-container">
                    {imageUrl ? (
                        <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <div style={{ width: '100%', height: 180, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Img</div>
                    )}
                </div>

                <div className="produit-info">
                    <h3 className="produit-name">{product.name}</h3>
                    <p className="produit-price">{product.basePrice} DT</p>

                    <div className="produit-rating">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#E5E7EB" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                        ))}
                        <span className="produit-reviews">(0)</span>
                    </div>

                    <div className="produit-sold-badge">
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
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px',
                    }}
                    onClick={() => !isDeleting && setShowDeleteModal(false)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '32px',
                            maxWidth: '500px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                            }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </div>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: 700,
                                color: '#0d1c23',
                                margin: 0,
                                marginBottom: '8px',
                            }}>
                                Supprimer le produit
                            </h2>
                            <p style={{
                                fontSize: '15px',
                                color: '#6b7280',
                                margin: 0,
                            }}>
                                Cette action est irréversible
                            </p>
                        </div>

                        {/* Product Details */}
                        <div style={{
                            background: '#f9fafb',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '24px',
                            border: '2px solid #fee2e2',
                        }}>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#0d1c23',
                                margin: '0 0 16px 0',
                            }}>
                                Détails du produit à supprimer :
                            </h3>

                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                {imageUrl && (
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: '2px solid #e5e7eb',
                                        flexShrink: 0,
                                    }}>
                                        <img
                                            src={imageUrl}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        color: '#0d1c23',
                                        margin: '0 0 8px 0',
                                    }}>
                                        {product.name}
                                    </p>
                                    <p style={{
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        color: '#ef4444',
                                        margin: '0 0 8px 0',
                                    }}>
                                        {product.basePrice} DT
                                    </p>
                                    <p style={{
                                        fontSize: '13px',
                                        color: '#6b7280',
                                        margin: '0 0 4px 0',
                                    }}>
                                        Type: {product.type}
                                    </p>
                                    <p style={{
                                        fontSize: '13px',
                                        color: '#6b7280',
                                        margin: '0 0 4px 0',
                                    }}>
                                        Créé le: {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                                    </p>
                                    <p style={{
                                        fontSize: '13px',
                                        color: '#6b7280',
                                        margin: 0,
                                    }}>
                                        Vendu: {product._count.orderItems} fois
                                    </p>
                                </div>
                            </div>

                            {product.description && (
                                <div style={{
                                    marginTop: '12px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid #e5e7eb',
                                }}>
                                    <p style={{
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: '#6b7280',
                                        margin: '0 0 6px 0',
                                    }}>
                                        Description:
                                    </p>
                                    <p style={{
                                        fontSize: '13px',
                                        color: '#4b5563',
                                        margin: 0,
                                        lineHeight: '1.5',
                                    }}>
                                        {product.description.length > 200
                                            ? `${product.description.substring(0, 200)}...`
                                            : product.description}
                                    </p>
                                </div>
                            )}

                            {/* Warning Box */}
                            <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                background: '#fef2f2',
                                borderRadius: '8px',
                                border: '1px solid #fecaca',
                            }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                        <line x1="12" y1="9" x2="12" y2="13"></line>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                    <div>
                                        <p style={{
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: '#991b1b',
                                            margin: '0 0 4px 0',
                                        }}>
                                            Attention
                                        </p>
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#7f1d1d',
                                            margin: 0,
                                            lineHeight: '1.4',
                                        }}>
                                            {product._count.orderItems > 0
                                                ? `Ce produit a été vendu ${product._count.orderItems} fois. La suppression affectera les commandes associées.`
                                                : 'Ce produit sera définitivement supprimé et ne pourra pas être récupéré.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end',
                        }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    border: '2px solid #e5e7eb',
                                    background: 'white',
                                    color: '#4b5563',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: isDeleting ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) => {
                                    if (!isDeleting) {
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                        e.currentTarget.style.background = '#f9fafb';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isDeleting) {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.background = 'white';
                                    }
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: isDeleting
                                        ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: isDeleting ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isDeleting) {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isDeleting) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                                    }
                                }}
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

