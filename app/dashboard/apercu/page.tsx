import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LoadingLink } from "@/components";
import Image from "next/image";
import { getR2Url } from "@/lib/storage";
import SalesChart from "./SalesChart";
import styles from "./apercu.module.css";

export default async function ApercuPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/create-shop");
    }

    // Use findUnique if possible, or findFirst with explicit limit
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
        // Explicitly set to get only the first result without pagination
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
        <>
            <div className={styles.grid}>
                {/* Row 1: Ventes totales & Commandes en attente */}
                <div className={`${styles.card} ${styles.ventes}`}>
                    <h3 className={styles.cardLabel}>Ventes totales</h3>
                    <div className={styles.cardValue}>
                        <span className={styles.value}>{totalSales.toFixed(0)}</span>
                        <span className={styles.currency}>DT</span>
                    </div>
                    <div className={`${styles.change} ${styles.changePositive}`}>
                        +0%
                    </div>
                    <div className={styles.cardSubtitle}>Depuis le mois dernier</div>
                </div>

                <LoadingLink
                    href="/dashboard/commandes?status=non-confirme"
                    className={`${styles.card} ${styles.commandes} ${styles.cardLink}`}
                >
                    <h3 className={styles.cardLabel}>Commandes en attente</h3>
                    <div className={styles.cardValueSimple}>
                        {pendingOrdersCount}
                    </div>
                    <div className={`${styles.change} ${styles.changeNegative}`}>
                        -0%
                    </div>
                    <div className={styles.cardSubtitle}>Depuis le mois dernier</div>
                </LoadingLink>

                {/* Row 2: Paiement en attente */}
                <LoadingLink
                    href="/dashboard/portefeuille"
                    className={`${styles.card} ${styles.paiementAttente} ${styles.cardLink}`}
                >
                    <h3 className={styles.cardLabel}>Paiement en attente</h3>
                    <div className={styles.cardValue}>
                        <span className={styles.value}>0</span>
                        <span className={styles.currency}>DT</span>
                    </div>
                    <div className={`${styles.change} ${styles.changePositive}`}>
                        +0%
                    </div>
                    <div className={styles.cardSubtitle}>Depuis le mois dernier</div>
                </LoadingLink>

                {/* Row 3: Paiement en cours */}
                <LoadingLink
                    href="/dashboard/portefeuille"
                    className={`${styles.card} ${styles.paiementCours} ${styles.cardLink}`}
                >
                    <div className={styles.headerRow}>
                        <h3 className={styles.cardLabel}>Paiement en cours</h3>
                        <div className={styles.date}>{new Date().toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div className={styles.subtitleSpecial}>Le montant d&apos;argent que vous pouvez retirer !</div>
                    <div className={styles.cardValue}>
                        <span className={styles.value}>0</span>
                        <span className={styles.currency}>DT</span>
                    </div>
                    <div className={styles.cardNotice}>Une fois prêt, un courriel vous sera envoyé.</div>
                </LoadingLink>

                {/* Row 4: Commandes retournées */}
                <LoadingLink
                    href="/dashboard/commandes?status=retours"
                    className={`${styles.card} ${styles.retournees} ${styles.cardLink}`}
                >
                    <h3 className={styles.cardLabel}>Commandes retournées</h3>
                    <div className={styles.cardValueNegative}>
                        <span className={styles.value}>-0</span>
                        <span className={styles.currency}>DT</span>
                    </div>
                </LoadingLink>

                {/* Sales Trend Chart */}
                <SalesChart />
            </div>
        </>
    );
}

