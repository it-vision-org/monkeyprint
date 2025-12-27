'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Checkout() {
    const router = useRouter();
    const [showSummary, setShowSummary] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        city: '',
        address: ''
    });

    const tunisianCities = [
        'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 
        'Gafsa', 'Monastir', 'Ben Arous', 'Kasserine', 'Médenine', 'Nabeul',
        'Tataouine', 'Béja', 'Jendouba', 'Mahdia', 'Sidi Bouzid', 'Siliana',
        'Kébili', 'Tozeur', 'Manouba', 'Zaghouan', 'La Marsa', 'Hammamet'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setOrderSuccess(true);
    };

    if (orderSuccess) {
        return (
            <div className="order-success-page">
                <div className="order-success-content">
                    <div className="order-success-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#10b981"/>
                            <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h1 className="order-success-title">Félicitations!</h1>
                    <p className="order-success-message">Votre commande a été passée avec succès</p>
                    
                    <div className="order-success-details">
                        <h3 className="order-success-subtitle">Détails de la commande</h3>
                        <div className="order-success-info">
                            <div className="order-success-row">
                                <span className="order-success-label">Nom:</span>
                                <span className="order-success-value">{formData.name}</span>
                            </div>
                            <div className="order-success-row">
                                <span className="order-success-label">Téléphone:</span>
                                <span className="order-success-value">{formData.phone}</span>
                            </div>
                            <div className="order-success-row">
                                <span className="order-success-label">Ville:</span>
                                <span className="order-success-value">{formData.city}</span>
                            </div>
                            <div className="order-success-row">
                                <span className="order-success-label">Adresse:</span>
                                <span className="order-success-value">{formData.address}</span>
                            </div>
                        </div>

                        <div className="order-success-products">
                            <h3 className="order-success-subtitle">Produits commandés</h3>
                            <div className="order-success-product">
                                <Image src="/mock-shirt.png" alt="T-Shirt Circles" width={60} height={60} style={{ objectFit: 'contain' }} />
                                <div className="order-success-product-info">
                                    <p className="order-success-product-name">T-Shirt Circles</p>
                                    <p className="order-success-product-price">50dt × 1</p>
                                </div>
                            </div>
                        </div>

                        <div className="order-success-total">
                            <span>Total:</span>
                            <span className="order-success-total-amount">109 DT</span>
                        </div>
                    </div>

                    <button className="order-success-btn" onClick={() => router.push('/store/theme-1')}>
                        Retour à la boutique
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <header className="checkout-header">
                <button className="checkout-back-btn" onClick={() => router.back()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2"/>
                    </svg>
                </button>
                <h1 className="checkout-title">Veuillez saisir vos coordonnees</h1>
                <div style={{ width: '24px' }}></div>
            </header>

            <div className="checkout-container">
                <div className="checkout-summary-wrapper">
                    <button 
                        className={`checkout-summary-toggle ${showSummary ? 'checkout-summary-toggle-expanded' : ''}`}
                        onClick={() => setShowSummary(!showSummary)}
                    >
                        <span>Resume de la commande</span>
                        <div className="checkout-summary-amount">
                            <span>109DT</span>
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none"
                                style={{ transform: showSummary ? 'rotate(180deg)' : 'none' }}
                            >
                                <path d="M6 9L12 15L18 9" stroke="#f97316" strokeWidth="2"/>
                            </svg>
                        </div>
                    </button>

                    {showSummary && (
                        <div className="checkout-summary-expanded">
                            <div className="checkout-summary-item">
                                <Image src="/mock-shirt.png" alt="T-Shirt Circles" width={60} height={60} style={{ objectFit: 'contain' }} />
                                <div className="checkout-summary-item-details">
                                    <p className="checkout-summary-item-name">T-Shirt Circles</p>
                                    <div className="checkout-summary-item-badges">
                                        <span className="checkout-summary-size-badge">L</span>
                                        <span className="checkout-summary-qty-badge">x10</span>
                                    </div>
                                </div>
                                <span className="checkout-summary-item-price">50dt</span>
                            </div>
                            <div className="checkout-summary-item">
                                <Image src="/mock-shirt.png" alt="T-Shirt Circles" width={60} height={60} style={{ objectFit: 'contain' }} />
                                <div className="checkout-summary-item-details">
                                    <p className="checkout-summary-item-name">T-Shirt Circles</p>
                                    <div className="checkout-summary-item-badges">
                                        <span className="checkout-summary-size-badge">M</span>
                                        <span className="checkout-summary-qty-badge">x10</span>
                                    </div>
                                </div>
                                <span className="checkout-summary-item-price">50dt</span>
                            </div>
                            <div className="checkout-summary-costs">
                                <div className="checkout-summary-cost-row">
                                    <span>Livraison</span>
                                    <span>9DT</span>
                                </div>
                                <div className="checkout-summary-cost-row checkout-summary-total">
                                    <span>Totale</span>
                                    <span>109DT</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <form className="checkout-form" onSubmit={handleSubmit}>
                    <div className="checkout-form-group">
                        <label>Nom et prénom</label>
                        <input 
                            type="text" 
                            placeholder="" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>

                    <div className="checkout-form-group">
                        <label>Numéro de téléphone</label>
                        <input 
                            type="tel" 
                            placeholder="" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            required
                        />
                    </div>

                    <div className="checkout-form-group">
                        <label>Sélectionner ville</label>
                        <select 
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            required
                        >
                            <option value="">Sélectionner ville</option>
                            {tunisianCities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="checkout-form-group">
                        <label>Adresse</label>
                        <input 
                            type="text" 
                            placeholder="" 
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            required
                        />
                    </div>

                    <button type="submit" className="checkout-submit-btn">
                        Passer commande
                    </button>
                </form>
            </div>
        </div>
    );
}

