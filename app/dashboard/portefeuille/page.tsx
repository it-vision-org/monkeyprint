
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { LoadingLink } from "@/components";
import styles from "../../styles/portefeuille.module.css";

export default async function PortefeuillePage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true }
    });

    if (!user || !user.store) redirect("/create-shop");
    const store = user.store;

    // Only fetch DELIVERED_AND_PAID orders (these are the only ones that contribute to wallet)
    const deliveredOrders = await prisma.order.findMany({
        where: {
            storeId: store.id,
            status: 'DELIVERED_AND_PAID'
        },
        orderBy: { deliveredAt: 'desc' },
        include: { items: true }
    });

    // Calculate dates for 14-day rule
    const now = new Date();
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // "En attente" - orders delivered less than 14 days ago
    const pendingOrders = deliveredOrders.filter((o: typeof deliveredOrders[number]) => {
        if (!o.deliveredAt) return false;
        return new Date(o.deliveredAt) > fourteenDaysAgo;
    });
    const pendingAmount = pendingOrders.reduce((acc: number, o: typeof pendingOrders[number]) => acc + o.totalAmount, 0);

    // "Pret" - orders delivered more than 14 days ago (ready to withdraw)
    const availableOrders = deliveredOrders.filter((o: typeof deliveredOrders[number]) => {
        if (!o.deliveredAt) return false;
        return new Date(o.deliveredAt) <= fourteenDaysAgo;
    });
    const availableAmount = availableOrders.reduce((acc: number, o: typeof availableOrders[number]) => acc + o.totalAmount, 0);

    // Get last withdrawal
    const lastWithdrawal = await prisma.withdrawal.findFirst({
        where: {
            storeId: store.id,
            status: { in: ['APPROVED', 'COMPLETED'] }
        },
        orderBy: { processedAt: 'desc' }
    });

    const withdrawnAmount = lastWithdrawal?.amount || 0;

    return (
        <div className={styles.portefeuilleMain}>
            <div className={styles.portefeuilleContainer}>
                <div className={styles.portefeuillePageHeader}>
                    <h1 className={styles.portefeuillePageTitle}>Portefeuille</h1>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 8H3M21 8V16C21 16.5304 20.7893 17.0391 20.4142 17.4142C20.0391 17.7893 19.5304 18 19 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V8M21 8L19 3H5L3 8" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="13" r="2" stroke="#1f2937" strokeWidth="2" />
                    </svg>
                </div>

                {/* Paiement en attente */}
                <div className={styles.portefeuilleSection}>
                    <div className={`${styles.portefeuilleSectionIcon} ${styles.orangeIcon}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                            <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className={styles.portefeuilleSectionContent}>
                        <h3 className={styles.portefeuilleSectionTitle}>Paiement en attente</h3>
                        <p className={styles.portefeuilleSectionDesc}>Le montant des ventes en attente d&apos;être déposé dans votre portefeuille !</p>
                        <div className={`${styles.portefeuilleSectionAmount} ${styles.orangeAmount}`}>
                            <span className={styles.portefeuilleSectionValue}>{pendingAmount}</span>
                            <span className={styles.portefeuilleSectionCurrency}>DT</span>
                        </div>
                        <div className={styles.portefeuilleSectionItems}>
                            <div className={styles.portefeuilleSectionItemLabel}>Articles Vendus :</div>
                            {pendingOrders.slice(0, 3).map((order: typeof pendingOrders[number]) => (
                                <div key={order.id} className={styles.portefeuilleSectionItem}>
                                    <span>ID #{order.id.slice(0, 8)}</span>
                                    <span className={`${styles.portefeuilleSectionItemPrice} ${styles.orangePrice}`}>{order.totalAmount} DT</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className={styles.portefeuilleDivider}></div>

                {/* Paiement prêt */}
                <div className={styles.portefeuilleSection}>
                    <div className={`${styles.portefeuilleSectionIcon} ${styles.greenIcon}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2V22M17 7H9.5C8.57174 7 7.6815 7.36875 7.02513 8.02513C6.36875 8.6815 6 9.57174 6 10.5C6 11.4283 6.36875 12.3185 7.02513 12.9749C7.6815 13.6313 8.57174 14 9.5 14H14.5C15.4283 14 16.3185 14.3687 16.9749 15.0251C17.6313 15.6815 18 16.5717 18 17.5C18 18.4283 17.6313 19.3185 16.9749 19.9749C16.3185 20.6313 15.4283 21 14.5 21H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className={styles.portefeuilleSectionContent}>
                        <h3 className={styles.portefeuilleSectionTitle}>Paiement prêt</h3>
                        <p className={styles.portefeuilleSectionDesc}>Le montant d&apos;argent que vous pouvez retirer !</p>
                        <div className={styles.portefeuilleSectionDate}>{format(new Date(), "dd/MM/yyyy")}</div>
                        <div className={`${styles.portefeuilleSectionAmount} ${styles.greenAmount}`}>
                            <span className={styles.portefeuilleSectionValue}>{availableAmount}</span>
                            <span className={styles.portefeuilleSectionCurrency}>DT</span>
                        </div>
                        <div className={styles.portefeuilleSectionItems}>
                            <div className={styles.portefeuilleSectionItemLabel}>Articles Vendus et traité :</div>
                            {availableOrders.slice(0, 3).map((order: typeof availableOrders[number]) => (
                                <div key={order.id} className={styles.portefeuilleSectionItem}>
                                    <span>ID #{order.id.slice(0, 8)}</span>
                                    <span className={`${styles.portefeuilleSectionItemPrice} ${styles.greenPrice}`}>{order.totalAmount} DT</span>
                                </div>
                            ))}
                            <LoadingLink href="/dashboard/portefeuille/withdraw" className={styles.portefeuilleSectionButton} style={{ textDecoration: 'none', display: 'block' }}>
                                Recevez votre paiement
                            </LoadingLink>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className={styles.portefeuilleDivider}></div>

                {/* Votre dernier paiement */}
                <div className={styles.portefeuilleSection}>
                    <div className={`${styles.portefeuilleSectionIcon} ${styles.purpleIcon}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                            <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className={styles.portefeuilleSectionContent}>
                        <h3 className={styles.portefeuilleSectionTitle}>Votre dernier paiement</h3>
                        <p className={styles.portefeuilleSectionDesc}>Votre dernier retrait d&apos;argent !</p>
                        {lastWithdrawal && (
                            <div className={styles.portefeuilleSectionDate}>
                                {format(lastWithdrawal.processedAt || lastWithdrawal.requestedAt, "dd/MM/yyyy")}
                            </div>
                        )}
                        <div className={`${styles.portefeuilleSectionAmount} ${styles.purpleAmount}`}>
                            <span className={styles.portefeuilleSectionValue}>{withdrawnAmount}</span>
                            <span className={styles.portefeuilleSectionCurrency}>DT</span>
                        </div>
                        {lastWithdrawal && (
                            <div className={styles.portefeuilleSectionItems}>
                                <LoadingLink
                                    href="/dashboard/portefeuille/withdrawals"
                                    style={{
                                        display: 'block',
                                        marginTop: '12px',
                                        fontSize: '14px',
                                        color: '#a855f7',
                                        fontWeight: 600,
                                        textDecoration: 'none'
                                    }}
                                >
                                    Voir l&apos;historique complet →
                                </LoadingLink>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
