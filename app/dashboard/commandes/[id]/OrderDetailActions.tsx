'use client';

import { confirmOrder } from '../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/components/AlertContext';

interface OrderDetailActionsProps {
    orderId: string;
    currentStatus: string;
}

export default function OrderDetailActions({ orderId, currentStatus }: OrderDetailActionsProps) {
    const router = useRouter();
    const { confirm } = useAlert();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        const confirmed = await confirm('Confirmer cette commande ?', 'info');
        if (!confirmed) {
            return;
        }

        setIsUpdating(true);
        setError('');

        try {
            const result = await confirmOrder(orderId);
            if (result?.error) {
                setError(result.error);
            } else {
                router.refresh();
            }
        } catch (e) {
            console.error('Confirm error:', e);
            setError('Une erreur est survenue');
        } finally {
            setIsUpdating(false);
        }
    };

    // Only show confirmation button for PENDING orders
    if (currentStatus !== 'PENDING') {
        return (
            <div style={{ 
                padding: '20px', 
                background: '#f9fafb', 
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
            }}>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    Une fois confirmée, seuls les administrateurs peuvent modifier le statut de cette commande.
                </p>
            </div>
        );
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
            <button
                onClick={handleConfirm}
                disabled={isUpdating}
                style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#10b981',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    opacity: isUpdating ? 0.5 : 1,
                    transition: 'opacity 0.2s'
                }}
            >
                {isUpdating ? 'Confirmation...' : 'Confirmer la commande'}
            </button>
        </div>
    );
}

