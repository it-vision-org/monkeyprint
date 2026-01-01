'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserDetailActionsProps {
    userId: string;
    currentRole: string;
}

export default function UserDetailActions({ userId, currentRole }: UserDetailActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState(currentRole);

    const handleRoleChange = async (newRole: string) => {
        if (isLoading) return;
        
        if (!confirm(`Êtes-vous sûr de vouloir changer le rôle de cet utilisateur en ${newRole === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}?`)) {
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (response.ok) {
                setRole(newRole);
                router.refresh();
            } else {
                const error = await response.json();
                alert(error.error || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {role === 'USER' ? (
                <button
                    onClick={() => handleRoleChange('ADMIN')}
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
                    {isLoading ? 'Traitement...' : 'Promouvoir Admin'}
                </button>
            ) : role === 'ADMIN' ? (
                <button
                    onClick={() => handleRoleChange('USER')}
                    disabled={isLoading}
                    style={{
                        padding: '10px 20px',
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.6 : 1
                    }}
                >
                    {isLoading ? 'Traitement...' : 'Rétrograder Utilisateur'}
                </button>
            ) : null}
        </div>
    );
}

