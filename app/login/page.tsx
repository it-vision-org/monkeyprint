'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../create-shop/createShop.module.css';

export default function LoginPage() {
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
                // Successful login - redirect to dashboard
                router.push('/dashboard');
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
            <div className={styles.backgroundV4}>
                <div className={styles.backgroundGradient1}></div>
                <div className={styles.backgroundGradient2}></div>
                <div className={styles.backgroundGradient3}></div>
                <div className={styles.backgroundGradient4}></div>
            </div>

            <main style={{ position: 'relative', zIndex: 2, padding: '20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '390px' }}>
                    <div className={styles.step1Container}>
                        <h2 className={styles.mainTitle}>Se connecter</h2>

                        <div className="cs-card cs-card-profile" style={{ marginBottom: '24px' }}>
                            <div className="cs-profile-picture">
                                <Image src="/logo.png" alt="Monkey Print" width={96} height={96} />
                            </div>
                            <span className="cs-profile-username">Monkey Print</span>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="cs-card">
                                <div className="cs-card-heading">
                                    <h3>Adresse e-mail</h3>
                                    <span>Doit être rempli<span>*</span></span>
                                </div>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="cs-pill-input"
                                    required
                                    autoComplete="email"
                                    disabled={isLoading}
                                />

                                <div className="cs-card-heading" style={{ marginTop: '16px' }}>
                                    <h3>Mot de passe</h3>
                                    <span>Doit être rempli<span>*</span></span>
                                </div>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="cs-pill-input"
                                    required
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                />
                                {error && <p style={{ color: '#ff4444', marginTop: '16px', fontSize: '14px' }}>{error}</p>}
                            </div>

                            <button
                                className={`cs-primary-btn ${styles.step1Button}`}
                                type="submit"
                                disabled={isLoading}
                                style={{ marginTop: '24px' }}
                            >
                                {isLoading ? 'CONNEXION EN COURS...' : "SE CONNECTER"}
                            </button>
                        </form>

                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <Link 
                                href="/create-shop" 
                                style={{ color: '#fff', textDecoration: 'underline', fontSize: '14px' }}
                            >
                                Pas encore de compte ? Créer une boutique
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

