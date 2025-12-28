'use client';

import Image from "next/image";
import { useState } from "react";

export default function ComptePage() {
    const [shopName, setShopName] = useState("GrabMeShoe");
    const [email, setEmail] = useState("GrabMeShoe@gmail.com");
    const [phone, setPhone] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    return (
        <div className="compte-main">
                <div className="compte-container">
                    {/* Page Title */}
                    <div className="compte-title-row">
                        <h1 className="compte-page-title">Compte</h1>
                    </div>

                    {/* Profile Section */}
                    <div className="compte-profile-card">
                        <div className="compte-profile-avatar-wrapper">
                            <div className="compte-profile-avatar">
                                <Image src="/logo.png" alt="Profile" width={100} height={100} style={{ objectFit: 'contain' }} />
                            </div>
                            <button className="compte-profile-edit-btn" aria-label="Edit profile">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        <h2 className="compte-profile-name">{shopName}</h2>
                        <p className="compte-profile-email">{email}</p>
                        <div className="compte-profile-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Compte vérifié</span>
                        </div>
                    </div>

                    {/* Account Information Card */}
                    <div className="compte-form-section">
                        <div className="compte-form-section-header">
                            <div className="compte-form-section-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Adresse e-mail</span>
                                </label>
                                <input 
                                    type="email" 
                                    className="compte-input" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="votre@email.com"
                                />
                            </div>

                            <div className="compte-input-wrapper">
                                <label className="compte-input-label">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22 16.92V19.92C22 20.9804 21.5786 21.9978 20.8284 22.748C20.0783 23.4981 19.0609 23.92 18 23.92C16.9391 23.92 15.9217 23.4981 15.1716 22.748C14.4214 21.9978 14 20.9804 14 19.92V16.92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M18 11.92C20.2091 11.92 22 10.1291 22 7.92C22 5.71086 20.2091 3.92 18 3.92C15.7909 3.92 14 5.71086 14 7.92C14 10.1291 15.7909 11.92 18 11.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M2 4.92H6L8 10.92L5 13.92C5.5 15.92 6.5 17.92 8 19.92L11 16.92L16 18.92V22.92H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Numéro de téléphone</span>
                                </label>
                                <input 
                                    type="tel" 
                                    className="compte-input" 
                                    placeholder="+216 XX XXX XXX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <button className="compte-submit-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>Enregistrer les modifications</span>
                            </button>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="compte-form-section">
                        <div className="compte-form-section-header">
                            <div className="compte-form-section-icon security">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="compte-form-section-title">Sécurité</h3>
                                <p className="compte-form-section-desc">Modifiez votre mot de passe</p>
                            </div>
                        </div>

                        <div className="compte-form-body">
                            <div className="compte-input-wrapper">
                                <label className="compte-input-label">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Mot de passe actuel</span>
                                </label>
                                <input 
                                    type="password" 
                                    className="compte-input" 
                                    placeholder="Entrez votre mot de passe actuel"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>

                            <div className="compte-input-wrapper">
                                <label className="compte-input-label">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Nouveau mot de passe</span>
                                </label>
                                <input 
                                    type="password" 
                                    className="compte-input" 
                                    placeholder="Entrez votre nouveau mot de passe"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>

                            <div className="compte-input-wrapper">
                                <label className="compte-input-label">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Confirmer le nouveau mot de passe</span>
                                </label>
                                <input 
                                    type="password" 
                                    className="compte-input" 
                                    placeholder="Confirmez votre nouveau mot de passe"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <button className="compte-submit-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>Changer le mot de passe</span>
                            </button>
                        </div>
                    </div>
                </div>
        </div>
    );
}
