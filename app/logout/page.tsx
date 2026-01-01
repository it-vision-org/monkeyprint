'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        // Sign out and redirect to home
        signOut({ redirect: false }).then(() => {
            router.push('/');
            router.refresh();
        });
    }, [router]);

    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh',
            flexDirection: 'column',
            gap: '16px'
        }}>
            <p>Déconnexion en cours...</p>
        </div>
    );
}

