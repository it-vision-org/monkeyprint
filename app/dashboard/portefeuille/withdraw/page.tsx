'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAlert } from '@/components/AlertContext';

export default function WithdrawPage() {
    const router = useRouter();
    const { showAlert } = useAlert();
    const [amount, setAmount] = useState('');
    const [bankDetails, setBankDetails] = useState('');
    const [availableAmount, setAvailableAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingBalance, setIsLoadingBalance] = useState(true);

    useEffect(() => {
        // Fetch available balance
        fetch('/api/portefeuille/balance')
            .then(res => res.json())
            .then(data => {
                if (data.availableAmount !== undefined) {
                    setAvailableAmount(data.availableAmount);
                }
                setIsLoadingBalance(false);
            })
            .catch(err => {
                console.error('Error fetching balance:', err);
                setIsLoadingBalance(false);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!amount || parseFloat(amount) <= 0) {
            showAlert('Veuillez entrer un montant valide', 'warning');
            return;
        }

        if (parseFloat(amount) > availableAmount) {
            showAlert(`Le montant demandé dépasse le montant disponible (${availableAmount.toFixed(2)} DT)`, 'warning');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    bankDetails: bankDetails || null
                }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/dashboard/portefeuille/withdrawals');
            } else {
                showAlert(data.error || 'Une erreur est survenue', 'error');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error creating withdrawal:', error);
            showAlert('Une erreur est survenue', 'error');
            setIsLoading(false);
        }
    };

    return (
        <div className="portefeuille-main">
            <div className="portefeuille-container">
                <div style={{ marginBottom: '24px' }}>
                    <Link 
                        href="/dashboard/portefeuille" 
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            color: '#2563eb',
                            textDecoration: 'none',
                            fontSize: '14px',
                            marginBottom: '24px'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Retour au portefeuille
                    </Link>
                    <h1 className="portefeuille-page-title">Demander un retrait</h1>
                </div>

                <div style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    maxWidth: '600px'
                }}>
                    {isLoadingBalance ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            Chargement...
                        </div>
                    ) : (
                        <>
                            <div style={{ 
                                background: '#f0f9ff', 
                                borderRadius: '8px', 
                                padding: '16px',
                                marginBottom: '24px',
                                border: '1px solid #bae6fd'
                            }}>
                                <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '8px' }}>
                                    Montant disponible
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 700, color: '#0284c7' }}>
                                    {availableAmount.toFixed(2)} DT
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ 
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        marginBottom: '8px',
                                        color: '#374151'
                                    }}>
                                        Montant à retirer (DT)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={availableAmount}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setAmount(availableAmount.toFixed(2))}
                                        style={{
                                            marginTop: '8px',
                                            padding: '6px 12px',
                                            background: 'transparent',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            color: '#6b7280',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Utiliser tout le montant disponible
                                    </button>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ 
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        marginBottom: '8px',
                                        color: '#374151'
                                    }}>
                                        Détails bancaires (optionnel)
                                    </label>
                                    <textarea
                                        value={bankDetails}
                                        onChange={(e) => setBankDetails(e.target.value)}
                                        placeholder="Nom de la banque, numéro de compte, IBAN, etc."
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            outline: 'none',
                                            resize: 'vertical',
                                            fontFamily: 'inherit',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !amount || parseFloat(amount) <= 0}
                                        style={{
                                            flex: 1,
                                            padding: '12px 24px',
                                            background: isLoading ? '#9ca3af' : '#2563eb',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        {isLoading ? 'Traitement...' : 'Demander le retrait'}
                                    </button>
                                    <Link
                                        href="/dashboard/portefeuille"
                                        style={{
                                            padding: '12px 24px',
                                            background: 'white',
                                            color: '#374151',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            display: 'inline-block'
                                        }}
                                    >
                                        Annuler
                                    </Link>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

