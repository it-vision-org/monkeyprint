'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/components/AlertContext';

interface AdminOrderActionsProps {
    orderId: string;
    currentStatus: string;
}

export default function AdminOrderActions({ orderId, currentStatus }: AdminOrderActionsProps) {
    const router = useRouter();
    const { confirm } = useAlert();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');

    const handleStatusUpdate = async (newStatus: string) => {
        const confirmed = await confirm(`Êtes-vous sûr de vouloir changer le statut à "${getStatusLabel(newStatus)}"?`, 'warning');
        if (!confirmed) {
            return;
        }

        setIsUpdating(true);
        setError('');

        try {
            const response = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Une erreur est survenue');
            } else {
                router.refresh();
            }
        } catch (e) {
            console.error('Update error:', e);
            setError('Une erreur est survenue');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm('Êtes-vous sûr de vouloir supprimer cette commande définitivement ?', 'danger');
        if (!confirmed) {
            return;
        }

        setIsUpdating(true);
        setError('');

        try {
            const response = await fetch(`/api/admin/orders/${orderId}/delete`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Une erreur est survenue');
            } else {
                router.push('/admin/orders');
            }
        } catch (e) {
            console.error('Delete error:', e);
            setError('Une erreur est survenue');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'Confirmé';
            case 'IN_TREATMENT':
                return 'En traitement';
            case 'IN_DELIVERY':
                return 'En livraison';
            case 'DELIVERED_AND_PAID':
                return 'Livré et payé';
            case 'RETURN':
                return 'Retour';
            default:
                return status;
        }
    };

    const getStatusOptions = () => {
        // Admin can only update orders that are CONFIRMED or later
        if (currentStatus === 'PENDING') {
            return []; // Store owner must confirm first
        }

        switch (currentStatus) {
            case 'CONFIRMED':
                return [
                    { value: 'IN_TREATMENT', label: 'En traitement', color: '#3b82f6' },
                ];
            case 'IN_TREATMENT':
                return [
                    { value: 'IN_DELIVERY', label: 'En livraison', color: '#8b5cf6' },
                ];
            case 'IN_DELIVERY':
                return [
                    { value: 'DELIVERED_AND_PAID', label: 'Livré et payé', color: '#10b981' },
                    { value: 'RETURN', label: 'Retour', color: '#ef4444' },
                ];
            case 'DELIVERED_AND_PAID':
            case 'RETURN':
                return []; // Final states, no further updates
            default:
                return [];
        }
    };

    const options = getStatusOptions();

    return (
        <div style={{ 
            padding: '20px', 
            background: '#f9fafb', 
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
        }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Actions administrateur</h3>
            {error && (
                <div style={{ 
                    padding: '12px', 
                    background: '#fee2e2', 
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    marginBottom: '16px',
                    fontSize: '14px'
                }}>
                    {error}
                </div>
            )}
            
            {currentStatus === 'PENDING' && (
                <div style={{ 
                    padding: '12px', 
                    background: '#fef3c7', 
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    color: '#92400e',
                    marginBottom: '16px',
                    fontSize: '14px'
                }}>
                    Cette commande doit être confirmée par le propriétaire du magasin avant de pouvoir être mise à jour.
                </div>
            )}

            {options.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleStatusUpdate(option.value)}
                            disabled={isUpdating}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                borderRadius: '8px',
                                background: option.color,
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: isUpdating ? 'not-allowed' : 'pointer',
                                opacity: isUpdating ? 0.5 : 1,
                                transition: 'opacity 0.2s'
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <button
                    onClick={handleDelete}
                    disabled={isUpdating}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        opacity: isUpdating ? 0.5 : 1,
                        transition: 'opacity 0.2s'
                    }}
                >
                    Supprimer la commande
                </button>
            </div>
        </div>
    );
}

