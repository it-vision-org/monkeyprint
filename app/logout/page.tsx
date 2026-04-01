'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './logout.module.css';

export default function LogoutPage() {
    const router = useRouter();
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const runLogout = async () => {
            try {
                setIsFadingOut(true);
                await signOut({ redirect: false });
                if (!isMounted) return;
                router.replace('/');
                router.refresh();
            } catch (error) {
                console.error('Logout failed:', error);
                if (isMounted) {
                    setHasError(true);
                    setIsFadingOut(false);
                }
            }
        };
        runLogout();

        return () => {
            isMounted = false;
        };
    }, [router]);

    return (
        <div className={`${styles.logoutContainer} ${isFadingOut ? styles.fadeOut : styles.fadeIn}`}>
            <div className={styles.logoutContent}>
                <div className={styles.logoutSpinner}></div>
                <p className={styles.logoutText}>
                    {hasError ? 'Échec de la déconnexion. Réessayez.' : 'Déconnexion en cours...'}
                </p>
            </div>
        </div>
    );
}

