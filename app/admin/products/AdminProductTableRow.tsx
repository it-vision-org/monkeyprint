'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';

interface AdminProductTableRowProps {
    product: {
        id: string;
        name: string;
        description?: string | null;
        basePrice: number;
        createdAt: Date;
        imageUrl: string | null;
        store: {
            id: string;
            name: string;
            slug: string;
        };
        _count: {
            orderItems: number;
        };
    };
}

export default function AdminProductTableRow({ product }: AdminProductTableRowProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(product.name);
    const [editPrice, setEditPrice] = useState(product.basePrice.toString());
    const [editDescription, setEditDescription] = useState((product as any).description || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/products/${product.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.refresh();
            } else {
                const data = await response.json();
                alert(data.error || 'Erreur lors de la suppression');
                setIsDeleting(false);
                setShowDeleteModal(false);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Erreur lors de la suppression');
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleEditSave = async () => {
        if (!editName.trim() || !editPrice.trim()) {
            alert('Le nom et le prix sont requis');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`/api/admin/products/${product.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editName.trim(),
                    description: editDescription.trim() || null,
                    basePrice: parseFloat(editPrice),
                }),
            });

            if (response.ok) {
                setIsEditing(false);
                router.refresh();
            } else {
                const data = await response.json();
                alert(data.error || 'Erreur lors de la mise à jour');
                setIsSaving(false);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Erreur lors de la mise à jour');
            setIsSaving(false);
        }
    };

    const handleEditCancel = () => {
        setEditName(product.name);
        setEditPrice(product.basePrice.toString());
        setEditDescription((product as any).description || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <tr>
                <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {product.imageUrl && (
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                width={50}
                                height={50}
                                style={{ objectFit: 'contain', borderRadius: '8px' }}
                            />
                        )}
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                width: '100%',
                            }}
                            placeholder="Nom du produit"
                        />
                    </div>
                </td>
                <td>
                    <Link
                        href={`/admin/stores/${product.store.id}`}
                        style={{ color: '#2563eb', textDecoration: 'none' }}
                    >
                        {product.store.name}
                    </Link>
                </td>
                <td>
                    <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        step="0.01"
                        min="0"
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            width: '120px',
                        }}
                        placeholder="Prix"
                    />
                </td>
                <td>{product._count.orderItems}</td>
                <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                <td>
                    <div className="admin-action-buttons">
                        <button
                            onClick={handleEditSave}
                            disabled={isSaving}
                            className="admin-action-btn"
                            style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                opacity: isSaving ? 0.6 : 1,
                            }}
                            title="Enregistrer"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button
                            onClick={handleEditCancel}
                            disabled={isSaving}
                            className="admin-action-btn"
                            style={{
                                background: '#6b7280',
                                color: 'white',
                                border: 'none',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                            }}
                            title="Annuler"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <>
            <tr>
                <td>
                    <div className="admin-product-cell">
                        {product.imageUrl && (
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                width={50}
                                height={50}
                                style={{ objectFit: 'contain', borderRadius: '8px' }}
                            />
                        )}
                        <div>
                            <div className="admin-product-name">{product.name}</div>
                            <div className="admin-product-id" style={{ fontSize: '12px', color: '#6b7280' }}>
                                ID: {product.id.substring(0, 8)}...
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <Link
                        href={`/admin/stores/${product.store.id}`}
                        style={{
                            color: '#2563eb',
                            textDecoration: 'none',
                            fontWeight: 500,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                        {product.store.name}
                    </Link>
                </td>
                <td>{product.basePrice} DT</td>
                <td>{product._count.orderItems}</td>
                <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                <td>
                    <div className="admin-action-buttons">
                        <Link
                            href={`/shop/${product.store.slug}/product/${product.id}`}
                            target="_blank"
                            className="admin-action-btn view"
                            title="Voir le produit"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="admin-action-btn"
                            style={{ background: '#f59e0b', color: 'white', border: 'none' }}
                            title="Modifier"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            disabled={isDeleting}
                            className="admin-action-btn"
                            style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                cursor: isDeleting ? 'not-allowed' : 'pointer',
                                opacity: isDeleting ? 0.6 : 1,
                            }}
                            title="Supprimer"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 6V4A2 2 0 0 1 10 2H14A2 2 0 0 1 16 4V6M19 6V20A2 2 0 0 1 17 22H7A2 2 0 0 1 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
            <ConfirmModal
                isOpen={showDeleteModal}
                message={`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?\nCette action est irréversible.`}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
            />
        </>
    );
}

