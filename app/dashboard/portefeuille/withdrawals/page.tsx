import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import styles from "../../../styles/portefeuille.module.css";

export default async function WithdrawalsPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true }
    });

    if (!user || !user.store) redirect("/create-shop");
    const store = user.store;

    const withdrawals = await prisma.withdrawal.findMany({
        where: { storeId: store.id },
        orderBy: { requestedAt: 'desc' }
    });

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'En attente';
            case 'APPROVED':
                return 'Approuvé';
            case 'REJECTED':
                return 'Rejeté';
            case 'COMPLETED':
                return 'Terminé';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return '#f97316';
            case 'APPROVED':
            case 'COMPLETED':
                return '#10b981';
            case 'REJECTED':
                return '#ef4444';
            default:
                return '#6b7280';
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
                    <h1 className={styles.portefeuillePageTitle}>Historique des retraits</h1>
                </div>

                {withdrawals.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateText}>
                            Aucun retrait pour le moment
                        </div>
                        <Link
                            href="/dashboard/portefeuille/withdraw"
                            className={styles.primaryButton}
                        >
                            Demander un retrait
                        </Link>
                    </div>
                ) : (
                    <div className={styles.withdrawalList}>
                        {withdrawals.map((withdrawal: typeof withdrawals[number]) => (
                            <div
                                key={withdrawal.id}
                                className={styles.withdrawalCard}
                            >
                                <div className={styles.withdrawalCardHeader}>
                                    <div>
                                        <div className={styles.withdrawalAmount}>
                                            {withdrawal.amount.toFixed(2)} DT
                                        </div>
                                        <div className={styles.withdrawalDate}>
                                            Demandé le {format(withdrawal.requestedAt, "dd/MM/yyyy à HH:mm")}
                                        </div>
                                    </div>
                                    <div className={styles.statusBadge} style={{
                                        background: getStatusColor(withdrawal.status) + '20',
                                        color: getStatusColor(withdrawal.status),
                                    }}>
                                        {getStatusLabel(withdrawal.status)}
                                    </div>
                                </div>

                                {withdrawal.processedAt && (
                                    <div className={styles.withdrawalDate} style={{ marginBottom: '8px' }}>
                                        Traité le {format(withdrawal.processedAt, "dd/MM/yyyy à HH:mm")}
                                    </div>
                                )}

                                {withdrawal.bankDetails && (
                                    <div className={styles.withdrawalDetails}>
                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Détails bancaires:</div>
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{withdrawal.bankDetails}</div>
                                    </div>
                                )}

                                {withdrawal.notes && (
                                    <div className={styles.withdrawalNotes}>
                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Notes:</div>
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{withdrawal.notes}</div>
                                    </div>
                                )}

                                <div className={styles.withdrawalId}>
                                    ID: {withdrawal.id.slice(0, 8)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <Link
                        href="/dashboard/portefeuille/withdraw"
                        className={styles.primaryButton}
                    >
                        Nouvelle demande de retrait
                    </Link>
                </div>
            </div>
        </div>
    );
}


