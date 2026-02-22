'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAlert } from '@/components';
import styles from "../../../styles/portefeuille.module.css";

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
        <div className={styles.portefeuilleMain}>
            <div className={styles.portefeuilleContainer}>
                <div style={{ marginBottom: '24px' }}>
                    <Link
                        href="/dashboard/portefeuille"
                        className={styles.backLink}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Retour au portefeuille
                    </Link>
                    <h1 className={styles.portefeuillePageTitle}>Demander un retrait</h1>
                </div>

                <div className={styles.withdrawalFormContainer}>
                    {isLoadingBalance ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            Chargement...
                        </div>
                    ) : (
                        <>
                            <div className={styles.availableBalanceCard}>
                                <div className={styles.availableBalanceLabel}>
                                    Montant disponible
                                </div>
                                <div className={styles.availableBalanceValue}>
                                    {availableAmount.toFixed(2)} DT
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>
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
                                        className={styles.formInput}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setAmount(availableAmount.toFixed(2))}
                                        className={styles.useMaxButton}
                                    >
                                        Utiliser tout le montant disponible
                                    </button>
                                </div>

                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>
                                        Détails bancaires (optionnel)
                                    </label>
                                    <textarea
                                        value={bankDetails}
                                        onChange={(e) => setBankDetails(e.target.value)}
                                        placeholder="Nom de la banque, numéro de compte, IBAN, etc."
                                        rows={4}
                                        className={styles.formTextarea}
                                    />
                                </div>

                                <div className={styles.submitButtonGroup}>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !amount || parseFloat(amount) <= 0}
                                        className={styles.submitButton}
                                    >
                                        {isLoading ? 'Traitement...' : 'Demander le retrait'}
                                    </button>
                                    <Link
                                        href="/dashboard/portefeuille"
                                        className={styles.cancelButton}
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

