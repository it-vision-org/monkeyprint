'use client';

import { useState } from "react";
import { updateProfile } from "./actions";

export default function CompteForm({ initialShopName, email, storeId }: { initialShopName: string, email: string, storeId: string }) {
    const [shopName, setShopName] = useState(initialShopName);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('shopName', shopName);
        formData.append('storeId', storeId);

        await updateProfile(formData);
        setIsSubmitting(false);
        alert("Profil mis à jour");
    };

    return (
        <form onSubmit={handleSubmit} className="compte-form-section">
            <div className="compte-form-section-header">
                <div className="compte-form-section-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div>
                    <h3 className="compte-form-section-title">Informations du compte</h3>
                    <p className="compte-form-section-desc">Gérez vos informations personnelles</p>
                </div>
            </div>

            <div className="compte-form-body">
                <div className="compte-input-wrapper">
                    <label className="compte-input-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Nom de la boutique</span>
                    </label>
                    <input
                        type="text"
                        className="compte-input"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="Nom de votre boutique"
                    />
                </div>

                <div className="compte-input-wrapper">
                    <label className="compte-input-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Adresse e-mail</span>
                    </label>
                    <input
                        type="email"
                        className="compte-input"
                        value={email}
                        disabled
                        style={{ opacity: 0.7 }}
                    />
                </div>

                <button type="submit" className="compte-submit-btn" disabled={isSubmitting}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}</span>
                </button>
            </div>
        </form>
    );
}
