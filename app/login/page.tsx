'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../create-shop/createShop.module.css';
import loginStyles from './login.module.css';
import { MainHeader, LoadingButton, LoadingLink } from '@/components';

import { Suspense } from 'react';

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000' }} />}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Email ou mot de passe incorrect');
                setIsLoading(false);
            } else {
                // Successful login - redirect to dashboard apercu
                router.push('/dashboard/apercu');
                router.refresh();
            }
        } catch (e) {
            console.error('Login error:', e);
            setError('Une erreur est survenue');
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.createShopContainer}>
            <MainHeader
                menuItems={[
                    { label: "Accueil", href: "/", icon: "🏠" },
                    { label: "Découvrez les boutiques", href: "/stores", icon: "🔥" },
                    { label: "Contactez-nous", href: "/contact", icon: "💬" }
                ]}
            />
            <div className={styles.backgroundV4}>
                <div className={styles.backgroundGradient1}></div>
                <div className={styles.backgroundGradient2}></div>
                <div className={styles.backgroundGradient3}></div>
                <div className={styles.backgroundGradient4}></div>
            </div>

            <main style={{ position: 'relative', zIndex: 2, padding: '20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
                <div className={loginStyles.loginFormContainer}>
                    <div className={styles.step1Container}>
                        <h2 className={styles.mainTitle}>Se connecter</h2>

                        <div className={`${styles['cs-card']} ${styles['cs-card-profile']}`} style={{ marginBottom: '24px' }}>
                            <div className={styles['cs-profile-picture']}>
                                <Image src="/logo.png" alt="Monkey Print" width={96} height={96} />
                            </div>
                            <span className={styles['cs-profile-username']}>Monkey Print</span>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles['cs-card']}>
                                <div className={styles['cs-card-heading']}>
                                    <h3>Adresse e-mail</h3>
                                    <span>Doit être rempli<span>*</span></span>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles['cs-pill-input']}
                                    required
                                    autoComplete="email"
                                    disabled={isLoading}
                                />

                                <div className={styles['cs-card-heading']} style={{ marginTop: '16px' }}>
                                    <h3>Mot de passe</h3>
                                    <span>Doit être rempli<span>*</span></span>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles['cs-pill-input']}
                                    required
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                />
                                {error && <p style={{ color: '#ff4444', marginTop: '16px', fontSize: '14px' }}>{error}</p>}
                            </div>

                            <LoadingButton
                                className={`${styles.step1Button}`}
                                type="submit"
                                isLoading={isLoading}
                                style={{ marginTop: '24px', width: '100%' }}
                                variant="success"
                                size="lg"
                            >
                                SE CONNECTER
                            </LoadingButton>
                        </form>

                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <LoadingLink
                                href="/create-shop"
                                style={{ color: '#fff', textDecoration: 'underline', fontSize: '14px' }}
                            >
                                Pas encore de compte ? Créer une boutique
                            </LoadingLink>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

