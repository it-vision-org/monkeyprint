'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import PageHeader from '../ui/PageHeader';
import { DEFAULT_CHECKOUT_ITEMS, TUNISIAN_CITIES } from '@/lib/constants/mockData';

type CheckoutPageProps = {
    baseRoute: string;
    initialOrderItems?: Array<{
        name: string;
        price: string;
        size: string;
        quantity: number;
    }>;
    shippingCost?: number;
    subtotal?: number;
};

export default function CheckoutPage({
    baseRoute,
    initialOrderItems = DEFAULT_CHECKOUT_ITEMS,
    shippingCost = 9,
    subtotal: initialSubtotal
}: CheckoutPageProps) {
    const router = useRouter();
    const [showSummary, setShowSummary] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        city: '',
        address: ''
    });

    const calculatedSubtotal = initialSubtotal || (initialOrderItems.length * 50);
    const total = calculatedSubtotal + shippingCost;

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
                            <circle cx="12" cy="12" r="10" fill="#10b981" />
                            <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
                            {initialOrderItems.map((item, idx) => (
                                <div key={idx} className="order-success-product">
                                    <Image src="/mock-shirt.png" alt={item.name} width={60} height={60} style={{ objectFit: 'contain' }} />
                                    <div className="order-success-product-info">
                                        <p className="order-success-product-name">{item.name}</p>
                                        <p className="order-success-product-price">{item.price} × {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-success-total">
                            <span>Total:</span>
                            <span className="order-success-total-amount">{total} DT</span>
                        </div>
                    </div>

                    <button className="order-success-btn" onClick={() => router.push(baseRoute)}>
                        Retour à la boutique
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <PageHeader
                title="Veuillez saisir vos coordonnees"
                className="checkout-header"
                backButtonClassName="checkout-back-btn"
                titleClassName="checkout-title"
            />

            <div className="checkout-container">
                <div className="checkout-summary-wrapper">
                    <button
                        className={`checkout-summary-toggle ${showSummary ? 'checkout-summary-toggle-expanded' : ''}`}
                        onClick={() => setShowSummary(!showSummary)}
                    >
                        <span>Resume de la commande</span>
                        <div className="checkout-summary-amount">
                            <span>{total}DT</span>
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                style={{ transform: showSummary ? 'rotate(180deg)' : 'none' }}
                            >
                                <path d="M6 9L12 15L18 9" stroke="#f97316" strokeWidth="2" />
                            </svg>
                        </div>
                    </button>

                    {showSummary && (
                        <div className="checkout-summary-expanded">
                            {initialOrderItems.map((item, idx) => (
                                <div key={idx} className="checkout-summary-item">
                                    <Image src="/mock-shirt.png" alt={item.name} width={60} height={60} style={{ objectFit: 'contain' }} />
                                    <div className="checkout-summary-item-details">
                                        <p className="checkout-summary-item-name">{item.name}</p>
                                        <div className="checkout-summary-item-badges">
                                            <span className="checkout-summary-size-badge">{item.size}</span>
                                            <span className="checkout-summary-qty-badge">x{item.quantity}</span>
                                        </div>
                                    </div>
                                    <span className="checkout-summary-item-price">{item.price}</span>
                                </div>
                            ))}
                            <div className="checkout-summary-costs">
                                <div className="checkout-summary-cost-row">
                                    <span>Livraison</span>
                                    <span>{shippingCost}DT</span>
                                </div>
                                <div className="checkout-summary-cost-row checkout-summary-total">
                                    <span>Totale</span>
                                    <span>{total}DT</span>
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
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="checkout-form-group">
                        <label>Numéro de téléphone</label>
                        <input
                            type="tel"
                            placeholder=""
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>

                    <div className="checkout-form-group">
                        <label>Sélectionner ville</label>
                        <select
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                        >
                            <option value="">Sélectionner ville</option>
                            {TUNISIAN_CITIES.map((city) => (
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
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
