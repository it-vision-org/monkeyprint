'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StoreDetailActionsProps {
    storeId: string;
    currentStatus: string;
}

export default function StoreDetailActions({ storeId, currentStatus }: StoreDetailActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(currentStatus);

    const handleStatusChange = async (newStatus: string) => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/stores/${storeId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setStatus(newStatus);
                router.refresh();
            } else {
                const error = await response.json();
                alert(error.error || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error('Error updating store status:', error);
            alert('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {status === 'ACTIVE' ? (
                <button
                    onClick={() => handleStatusChange('SUSPENDED')}
                    disabled={isLoading}
                    style={{
                        padding: '10px 20px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.6 : 1
                    }}
                >
                    {isLoading ? 'Traitement...' : 'Suspendre'}
                </button>
            ) : status === 'SUSPENDED' ? (
                <button
                    onClick={() => handleStatusChange('ACTIVE')}
                    disabled={isLoading}
                    style={{
                        padding: '10px 20px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.6 : 1
                    }}
                >
                    {isLoading ? 'Traitement...' : 'Activer'}
                </button>
            ) : null}
        </div>
    );
}

