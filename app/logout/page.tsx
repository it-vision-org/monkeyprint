'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './logout.module.css';

export default function LogoutPage() {
    const router = useRouter();
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        // Small delay to show the animation
        const timer = setTimeout(() => {
            setIsFadingOut(true);
            
            // Sign out after fade-out animation starts
            setTimeout(() => {
                signOut({ redirect: false }).then(() => {
                    router.push('/');
                    router.refresh();
                });
            }, 300); // Wait for fade-out animation to complete
        }, 1500); // Show loading animation for 1.5 seconds

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className={`${styles.logoutContainer} ${isFadingOut ? styles.fadeOut : styles.fadeIn}`}>
            <div className={styles.logoutContent}>
                <div className={styles.logoutSpinner}></div>
                <p className={styles.logoutText}>Déconnexion en cours...</p>
            </div>
        </div>
    );
}

