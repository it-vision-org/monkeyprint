import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getR2Url } from "@/lib/storage";
import SalesChart from "./SalesChart";
import styles from "./apercu.module.css";

export default async function ApercuPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/create-shop");
    }

    const store = await prisma.store.findFirst({
        where: {
            ownerId: session.user.id
        },
        include: {
            orders: {
                select: {
                    status: true,
                    totalAmount: true
                }
            }
        },
        take: 1
    });

    if (!store) {
        redirect("/create-shop");
    }

    // Calculate stats - only count confirmed orders and later
    const totalSales = store.orders
        .filter((o: any) => o.status !== 'PENDING') // Only count confirmed and later orders
        .reduce((sum: number, order: any) => sum + order.totalAmount, 0);

    const pendingOrdersCount = store.orders.filter((o: any) => o.status === 'PENDING').length;

    // Resolve logo URL from R2
    const logoUrl = store.logoUrl ? await getR2Url(store.logoUrl) : null;

    return (
        <div className={styles.dashboardWrapper}>
            <div className={styles.headerArea}>
                <h1 className={styles.pageTitle}>Aperçu de la boutique</h1>
                <p className={styles.pageSubtitle}>Suivez vos performances et gérez vos revenus.</p>
            </div>

            <div className={styles.grid}>
                {/* Row 1: Ventes totales */}
                <div className={`${styles.card} ${styles.ventes}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3 className={styles.cardLabel}>Ventes totales</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.cardValue}>
                            <span className={styles.value}>{totalSales.toFixed(0)}</span>
                            <span className={styles.currency}>DT</span>
                        </div>
                        <div className={styles.cardFooter}>
                            <span className={`${styles.change} ${styles.changePositive}`}>+0%</span>
                            <span className={styles.cardSubtitle}>Depuis le mois dernier</span>
                        </div>
                    </div>
                </div>

                {/* Commandes en attente */}
                <Link href="/dashboard/commandes?status=non-confirme" className={`${styles.card} ${styles.commandes} ${styles.cardLink}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3.27002 6.96L12 12.01L20.73 6.96M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3 className={styles.cardLabel}>Commandes en attente</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.cardValueSimple}>
                            {pendingOrdersCount}
                        </div>
                        <div className={styles.cardFooter}>
                            <span className={`${styles.change} ${styles.changeNegative}`}>-0%</span>
                            <span className={styles.cardSubtitle}>Depuis le mois dernier</span>
                        </div>
                    </div>
                </Link>

                {/* Paiement en attente */}
                <Link href="/dashboard/portefeuille" className={`${styles.card} ${styles.paiementAttente} ${styles.cardLink}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3 className={styles.cardLabel}>Paiement en attente</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.cardValue}>
                            <span className={styles.value}>0</span>
                            <span className={styles.currency}>DT</span>
                        </div>
                        <div className={styles.cardFooter}>
                            <span className={`${styles.change} ${styles.changePositive}`}>+0%</span>
                            <span className={styles.cardSubtitle}>Depuis le mois dernier</span>
                        </div>
                    </div>
                </Link>

                {/* Paiement en cours */}
                <Link href="/dashboard/portefeuille" className={`${styles.card} ${styles.paiementCours} ${styles.cardLink}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 9V7C17 6.46957 16.7893 5.96086 16.4142 5.58579C16.0391 5.21071 15.5304 5 15 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19H15C15.5304 19 16.0391 18.7893 16.4142 18.4142C16.7893 18.0391 17 17.5304 17 17V15M21 12H14M17 12C17 12.7956 16.6839 13.5587 16.1213 14.1213C15.5587 14.6839 14.7956 15 14 15C13.2044 15 12.4413 14.6839 11.8787 14.1213C11.3161 13.5587 11 12.7956 11 12C11 11.2044 11.3161 10.4413 11.8787 9.87868C12.4413 9.31607 13.2044 9 14 9C14.7956 9 15.5587 9.31607 16.1213 9.87868C16.6839 10.4413 17 11.2044 17 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3 className={styles.cardLabel}>Paiement en cours</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.cardValueNegative}>
                            <span className={styles.value}>0</span>
                            <span className={styles.currency}>DT</span>
                        </div>
                        <div className={styles.cardFooter} style={{ marginTop: '12px' }}>
                            <span className={styles.dateBadge} style={{ marginLeft: 0 }}>{new Date().toLocaleDateString('fr-FR')}</span>
                        </div>
                    </div>
                </Link>

                {/* Commandes retournées */}
                <Link href="/dashboard/commandes?status=retours" className={`${styles.card} ${styles.retournees} ${styles.cardLink}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9L8 4M3 9L8 14M3 9H14C15.8565 9 17.637 9.7375 18.9497 11.0503C20.2625 12.363 21 14.1435 21 16C21 17.8565 20.2625 19.637 18.9497 20.9497C17.637 22.2625 15.8565 23 14 23H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3 className={styles.cardLabel}>Commandes retournées</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.cardValueNegative}>
                            <span className={styles.value}>0</span>
                            <span className={styles.currency}>DT</span>
                        </div>
                    </div>
                </Link>

                {/* Sales Trend Chart */}
                <div className={styles.chartContainer}>
                    <SalesChart />
                </div>
            </div>
        </div>
    );
}

