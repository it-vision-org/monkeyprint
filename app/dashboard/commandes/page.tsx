
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import OrderActions from "./OrderActions";
import styles from "../../styles/commandes.module.css";

export default async function CommandesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true }
    });

    if (!user || !user.store) redirect("/create-shop");
    const store = user.store;

    const resolvedParams = await searchParams;
    const statusParam = resolvedParams.status || 'non-confirme';
    const query = resolvedParams.q || '';

    let whereStatus: any = {};

    if (statusParam === 'non-confirme') {
        whereStatus = { status: 'PENDING' };
    } else if (statusParam === 'confirme') {
        whereStatus = { status: { in: ['CONFIRMED', 'IN_TREATMENT', 'IN_DELIVERY', 'DELIVERED_AND_PAID'] } };
    } else if (statusParam === 'retours') {
        whereStatus = { status: 'RETURN' };
    }

    // Build search filter
    const searchFilter: any = {};
    if (query) {
        searchFilter.OR = [
            { id: { contains: query, mode: 'insensitive' } },
            { customer: { name: { contains: query, mode: 'insensitive' } } },
            { customer: { phoneNumber: { contains: query, mode: 'insensitive' } } },
            { customer: { address: { contains: query, mode: 'insensitive' } } },
        ];
    }

    const orders = await prisma.order.findMany({
        where: {
            storeId: store.id,
            ...whereStatus,
            ...searchFilter
        },
        include: {
            customer: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const getStatusConfig = () => {
        switch (statusParam) {
            case 'confirme':
                return {
                    title: 'Liste de commandes confirmé',
                    icon: 'check'
                };
            case 'retours':
                return {
                    title: 'Liste de commandes retourné',
                    icon: 'none',
                    showAlert: true
                };
            case 'non-confirme':
            default:
                return {
                    title: 'Liste de commandes non confirmé',
                    icon: 'check'
                };
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Non confirmé';
            case 'CONFIRMED':
                return 'Confirmé';
            case 'IN_TREATMENT':
                return 'En traitement';
            case 'IN_DELIVERY':
                return 'En livraison';
            case 'DELIVERED_AND_PAID':
                return 'Livré et payé';
            case 'RETURN':
                return 'Retour';
            default:
                return status;
        }
    };

    const getStatusEmoji = (status: string) => {
        switch (status) {
            case 'PENDING':
                return '⏳';
            case 'CONFIRMED':
                return '✅';
            case 'IN_TREATMENT':
                return '⚙️';
            case 'IN_DELIVERY':
                return '🚚';
            case 'DELIVERED_AND_PAID':
                return '💚';
            case 'RETURN':
                return '↩️';
            default:
                return '';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return '#f97316';
            case 'CONFIRMED':
                return '#3b82f6';
            case 'IN_TREATMENT':
                return '#8b5cf6';
            case 'IN_DELIVERY':
                return '#06b6d4';
            case 'DELIVERED_AND_PAID':
                return '#10b981';
            case 'RETURN':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const config = getStatusConfig();

    return (
        <div className={styles.commandesPage}>
            <div className={styles.commandesMain}>
                <div className={styles.commandesContainer}>
                    <div className={styles.commandesStatusTabs}>
                        <Link
                            href={`/dashboard/commandes?status=non-confirme${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                            className={`${styles.commandesStatusTab} ${statusParam === 'non-confirme' ? styles.active : ''}`}
                        >
                            <span className={`${styles.dashSubmenuDot} ${styles.orange}`}></span>
                            Non confirmé
                        </Link>
                        <Link
                            href={`/dashboard/commandes?status=confirme${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                            className={`${styles.commandesStatusTab} ${statusParam === 'confirme' ? styles.active : ''}`}
                        >
                            <span className={`${styles.dashSubmenuDot} ${styles.green}`}></span>
                            Confirmé
                        </Link>
                        <Link
                            href={`/dashboard/commandes?status=retours${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                            className={`${styles.commandesStatusTab} ${statusParam === 'retours' ? styles.active : ''}`}
                        >
                            <span className={`${styles.dashSubmenuDot} ${styles.red}`}></span>
                            Retours
                        </Link>
                    </div>

                    <div className={styles.commandesHeader}>
                        <h1 className={styles.commandesTitle}>
                            {config.title}
                            {statusParam === 'confirme' && (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.titleCheck}>
                                    <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </h1>
                    </div>

                    {config.showAlert && (
                        <div className={styles.commandesAlert}>
                            Les articles retournés revendus vous feront gagner le montant total du produit !
                        </div>
                    )}

                    <div className={styles.commandesSearchBar}>
                        <form action="/dashboard/commandes" method="get" className={styles.commandesSearch} style={{ width: '100%', display: 'flex' }}>
                            <input type="hidden" name="status" value={statusParam} />
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '12px', position: 'absolute', pointerEvents: 'none' }}>
                                <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <input
                                type="text"
                                name="q"
                                placeholder="Rechercher par ID, nom, téléphone ou adresse..."
                                defaultValue={query}
                                style={{ width: '100%', paddingLeft: '40px' }}
                            />
                        </form>
                    </div>

                    <div className={styles.commandesList}>
                        {orders.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                Aucune commande trouvée.
                            </div>
                        ) : (
                            orders.map((order: typeof orders[number]) => (
                                <Link
                                    key={order.id}
                                    href={`/dashboard/commandes/${order.id}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div className={styles.commandeCard}>
                                        <div className={styles.commandeCardHeader}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <div className={styles.commandeId}>#{order.id.slice(0, 8)}</div>
                                                {order.deletionRequested && (
                                                    <div className={styles.deletionBadge}>
                                                        Suppression demandée
                                                    </div>
                                                )}
                                                {statusParam === 'confirme' && (
                                                    <div className={styles.statusBadge} style={{
                                                        background: getStatusColor(order.status) + '20',
                                                        color: getStatusColor(order.status)
                                                    }}>
                                                        <span>{getStatusEmoji(order.status)}</span>
                                                        <span>{getStatusLabel(order.status)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.commandeHeaderRight}>
                                                <div className={styles.commandeDate}>{format(order.createdAt, "dd/MM/yyyy")}</div>
                                                <OrderActions orderId={order.id} status={order.status} deletionRequested={order.deletionRequested} />
                                            </div>
                                        </div>
                                        <div className={styles.commandeCardBody}>
                                            <div className={styles.commandeRow}>
                                                <div className={styles.commandeLabel}>Nom</div>
                                                <div className={styles.commandeValue}>{order.customer.name || '-'}</div>
                                            </div>
                                            <div className={styles.commandeRow}>
                                                <div className={styles.commandeLabel}>Adresse</div>
                                                <div className={styles.commandeValue}>{order.customer.address || '-'}</div>
                                            </div>
                                            <div className={styles.commandeRow}>
                                                <div className={styles.commandeLabel}>Numero</div>
                                                <div className={styles.commandeValue}>{order.customer.phoneNumber}</div>
                                            </div>
                                            <div className={styles.commandeRow}>
                                                <div className={styles.commandeLabel}>Total</div>
                                                <div className={styles.commandeTotal}>{order.totalAmount} DT</div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
