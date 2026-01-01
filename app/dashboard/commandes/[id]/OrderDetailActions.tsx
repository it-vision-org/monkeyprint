'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '../actions';

interface OrderDetailActionsProps {
    orderId: string;
    currentStatus: string;
}

export default function OrderDetailActions({ orderId, currentStatus }: OrderDetailActionsProps) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');

    const handleStatusUpdate = async (newStatus: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir changer le statut à "${newStatus}"?`)) {
            return;
        }

        setIsUpdating(true);
        setError('');

        try {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result?.error) {
                setError(result.error);
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

    const getStatusOptions = () => {
        switch (currentStatus) {
            case 'PENDING':
                return [
                    { value: 'PAID', label: 'Marquer comme Payé', color: '#10b981' },
                    { value: 'SHIPPED', label: 'Marquer comme Expédié', color: '#3b82f6' },
                ];
            case 'PAID':
                return [
                    { value: 'SHIPPED', label: 'Marquer comme Expédié', color: '#3b82f6' },
                    { value: 'COMPLETED', label: 'Marquer comme Terminé', color: '#10b981' },
                ];
            case 'SHIPPED':
                return [
                    { value: 'COMPLETED', label: 'Marquer comme Terminé', color: '#10b981' },
                    { value: 'RETURNED', label: 'Marquer comme Retourné', color: '#ef4444' },
                ];
            default:
                return [];
        }
    };

    const options = getStatusOptions();

    if (options.length === 0) {
        return null;
    }

    return (
        <div style={{ 
            padding: '20px', 
            background: '#f9fafb', 
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
        }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Actions</h3>
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
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
        </div>
    );
}

