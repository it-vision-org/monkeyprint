'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAlert } from '@/components/AlertContext';

interface AdminOrderTableRowProps {
    order: {
        id: string;
        status: string;
        totalAmount: number;
        createdAt: string | Date;
        updatedAt: string | Date;
        deletionRequested: boolean;
        store: { name: string };
        customer: { name: string };
        _count: { items: number };
    };
}

export default function AdminOrderTableRow({ order }: AdminOrderTableRowProps) {
    const router = useRouter();
    const { confirm, showAlert } = useAlert();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'orange';
            case 'CONFIRMED': return 'blue';
            case 'IN_TREATMENT': return 'blue';
            case 'IN_DELIVERY': return 'purple';
            case 'DELIVERED_AND_PAID': return 'green';
            case 'RETURN': return 'red';
            default: return 'gray';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Non confirmé';
            case 'CONFIRMED': return 'Confirmé';
            case 'IN_TREATMENT': return 'En traitement';
            case 'IN_DELIVERY': return 'En livraison';
            case 'DELIVERED_AND_PAID': return 'Livré et payé';
            case 'RETURN': return 'Retour';
            default: return status;
        }
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isStatusModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isStatusModalOpen]);

    const getAllStatusOptions = () => {
        // Admin can change to any status except PENDING (must be confirmed by store owner)
        const allStatuses = [
            { value: 'CONFIRMED', label: 'Confirmé', color: '#3b82f6' },
            { value: 'IN_TREATMENT', label: 'En traitement', color: '#3b82f6' },
            { value: 'IN_DELIVERY', label: 'En livraison', color: '#8b5cf6' },
            { value: 'DELIVERED_AND_PAID', label: 'Livré et payé', color: '#10b981' },
            { value: 'RETURN', label: 'Retour', color: '#ef4444' }
        ];

        // Filter out current status
        return allStatuses.filter(status => status.value !== order.status);
    };

    const handleStatusUpdate = async (newStatus: string) => {
        setIsStatusModalOpen(false);
        const confirmed = await confirm(
            `Changer le statut de "${getStatusLabel(order.status)}" à "${getStatusLabel(newStatus)}" ?`,
            'warning'
        );
        if (!confirmed) return;

        setIsUpdating(true);
        try {
            const response = await fetch(`/api/admin/orders/${order.id}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();
            if (!response.ok) {
                showAlert(data.error || 'Une erreur est survenue', 'error');
            } else {
                router.refresh();
            }
        } catch (error) {
            showAlert('Une erreur est survenue', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm(
            'Êtes-vous sûr de vouloir supprimer cette commande définitivement ?',
            'danger'
        );
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/orders/${order.id}/delete`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (!response.ok) {
                showAlert(data.error || 'Une erreur est survenue', 'error');
            } else {
                router.refresh();
            }
        } catch (error) {
            showAlert('Une erreur est survenue', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const statusColor = getStatusColor(order.status);

    return (
        <tr className="admin-order-row">
            <td className="admin-order-id-cell">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                        {order.id.substring(0, 8)}
                    </span>
                    {order.deletionRequested && (
                        <span className="admin-order-deletion-badge">
                            Suppression demandée
                        </span>
                    )}
                </div>
            </td>
            <td>
                <span style={{ fontWeight: 500 }}>{order.store.name}</span>
            </td>
            <td>
                <span style={{ fontWeight: 500 }}>{order.customer.name}</span>
            </td>
            <td>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    {order._count.items} {order._count.items > 1 ? 'articles' : 'article'}
                </span>
            </td>
            <td className="admin-order-amount-cell">
                <span style={{ fontWeight: 700, fontSize: '15px' }}>
                    {order.totalAmount} DT
                </span>
            </td>
            <td>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (order.status !== 'PENDING') {
                            setIsStatusModalOpen(true);
                        }
                    }}
                    disabled={order.status === 'PENDING' || isUpdating}
                    className={`admin-status-badge-clickable admin-status-badge ${statusColor}`}
                    style={{
                        cursor: order.status === 'PENDING' ? 'default' : 'pointer',
                        opacity: isUpdating ? 0.6 : 1,
                    }}
                    title={order.status === 'PENDING' ? 'Doit être confirmé par le propriétaire du magasin' : 'Cliquez pour changer le statut'}
                >
                    {getStatusLabel(order.status)}
                </button>
            </td>
            <td>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}
                </span>
            </td>
            <td className="admin-order-actions-cell">
                <div className="admin-order-inline-actions">
                    <div className="admin-order-buttons">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="admin-order-delete-btn"
                            title="Supprimer"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <Link
                            href={`/admin/orders/${order.id}`}
                            className="admin-order-view-btn"
                            onClick={(e) => e.stopPropagation()}
                            title="Voir les détails"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </td>

            {/* Status Selection Modal */}
            {isStatusModalOpen && (
                <div 
                    className="admin-status-modal-overlay"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isUpdating) {
                            setIsStatusModalOpen(false);
                        }
                    }}
                >
                    <div 
                        className="admin-status-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="admin-status-modal-close"
                            onClick={() => !isUpdating && setIsStatusModalOpen(false)}
                            disabled={isUpdating}
                        >
                            ×
                        </button>
                        
                        <h2 className="admin-status-modal-title">
                            Changer le statut de la commande
                        </h2>
                        
                        <p className="admin-status-modal-subtitle">
                            Statut actuel: <strong>{getStatusLabel(order.status)}</strong>
                        </p>

                        <div className="admin-status-modal-options">
                            {getAllStatusOptions().map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleStatusUpdate(option.value)}
                                    disabled={isUpdating}
                                    className="admin-status-modal-option"
                                    style={{
                                        borderLeft: `4px solid ${option.color}`,
                                        opacity: isUpdating ? 0.6 : 1,
                                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    <div className="admin-status-modal-option-content">
                                        <span 
                                            className="admin-status-modal-option-label"
                                            style={{ color: option.color }}
                                        >
                                            {option.label}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            className="admin-status-modal-cancel"
                            onClick={() => setIsStatusModalOpen(false)}
                            disabled={isUpdating}
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}
        </tr>
    );
}

