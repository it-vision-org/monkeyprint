'use client';

import { useState } from "react";
import Image from "next/image";
import { updateProfile, updateStoreTheme } from "./actions";
import { useAlert } from '@/components';
import styles from "../../styles/compte.module.css";

export default function CompteForm({ initialShopName, email, storeId, initialTheme }: { initialShopName: string, email: string, storeId: string, initialTheme: string }) {
    const { showAlert } = useAlert();
    const [shopName, setShopName] = useState(initialShopName);
    const [selectedTheme, setSelectedTheme] = useState(initialTheme || 'theme-1');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isThemeSubmitting, setIsThemeSubmitting] = useState(false);

    const themes = [
        { id: 'theme-1', label: "Design moderne", image: "/theme-1.png" },
        { id: 'theme-2', label: "Design audacieux", image: "/theme-2.png" },
        { id: 'theme-3', label: "Design minimal", image: "/theme-3.png" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('shopName', shopName);
        formData.append('storeId', storeId);

        await updateProfile(formData);
        setIsSubmitting(false);
        showAlert("Profil mis à jour", 'success');
    };

    const handleThemeChange = async (themeId: string) => {
        if (themeId === selectedTheme) return;

        setIsThemeSubmitting(true);
        setSelectedTheme(themeId);

        const formData = new FormData();
        formData.append('theme', themeId);
        formData.append('storeId', storeId);

        const result = await updateStoreTheme(formData);
        setIsThemeSubmitting(false);

        if (result?.error) {
            showAlert(result.error, 'error');
            setSelectedTheme(initialTheme); // Revert on error
        } else {
            showAlert("Thème mis à jour", 'success');
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className={styles.compteFormSection}>
                <div className={styles.compteFormSectionHeader}>
                    <div className={styles.compteFormSectionIcon}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={styles.compteFormSectionTitle}>Informations du compte</h3>
                        <p className={styles.compteFormSectionDesc}>Gérez vos informations personnelles</p>
                    </div>
                </div>

                <div className={styles.compteFormBody}>
                    <div className={styles.compteInputWrapper}>
                        <label className={styles.compteInputLabel}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Nom de la boutique</span>
                        </label>
                        <input
                            type="text"
                            className={styles.compteInput}
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            placeholder="Nom de votre boutique"
                        />
                    </div>

                    <div className={styles.compteInputWrapper}>
                        <label className={styles.compteInputLabel}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Adresse e-mail</span>
                        </label>
                        <input
                            type="email"
                            className={styles.compteInput}
                            value={email}
                            disabled
                            style={{ opacity: 0.7 }}
                        />
                    </div>

                    <button type="submit" className={styles.compteSubmitBtn} disabled={isSubmitting}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}</span>
                    </button>
                </div>
            </form>

            {/* Theme Selection Section */}
            <div className={styles.compteFormSection} style={{ marginTop: '32px' }}>
                <div className={styles.compteFormSectionHeader}>
                    <div className={styles.compteFormSectionIcon}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={styles.compteFormSectionTitle}>Thème de la boutique</h3>
                        <p className={styles.compteFormSectionDesc}>Choisissez le design de votre boutique</p>
                    </div>
                </div>

                <div className={styles.compteFormBody}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                type="button"
                                onClick={() => handleThemeChange(theme.id)}
                                disabled={isThemeSubmitting}
                                style={{
                                    position: 'relative',
                                    border: selectedTheme === theme.id ? '3px solid #0d9488' : '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    background: 'white',
                                    cursor: isThemeSubmitting ? 'not-allowed' : 'pointer',
                                    opacity: isThemeSubmitting ? 0.6 : 1,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ aspectRatio: '16/9', position: 'relative' }}>
                                    <Image
                                        src={theme.image}
                                        alt={theme.label}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div style={{ padding: '12px', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                                        {theme.label}
                                    </p>
                                </div>
                                {selectedTheme === theme.id && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        width: '24px',
                                        height: '24px',
                                        background: '#0d9488',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                    {isThemeSubmitting && (
                        <p style={{ marginTop: '12px', color: '#666', fontSize: '14px', textAlign: 'center' }}>
                            Mise à jour du thème...
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
