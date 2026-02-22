import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getR2Url } from "@/lib/storage";
import { format } from "date-fns";
import Link from "next/link";
import OrderDetailActions from "./OrderDetailActions";
import styles from "../../../styles/commandes.module.css";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true }
    });

    if (!user || !user.store) redirect("/create-shop");
    const store = user.store;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            customer: true,
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!order || order.storeId !== store.id) {
        notFound();
    }

    // Get product images
    const itemsWithImages = await Promise.all(
        order.items.map(async (item: typeof order.items[number]) => {
            const imageUrl = item.product.previewFront ? await getR2Url(item.product.previewFront) : null;
            return { ...item, imageUrl };
        })
    );

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return '#f97316';
            case 'CONFIRMED':
                return '#3b82f6';
            case 'IN_TREATMENT':
                return '#3b82f6';
            case 'IN_DELIVERY':
                return '#8b5cf6';
            case 'DELIVERED_AND_PAID':
                return '#10b981';
            case 'RETURN':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    return (
        <div className={styles.commandesPage}>
            <div className={styles.commandesMain}>
                <div className={styles.commandesContainer}>
                    <div style={{ marginBottom: '24px' }}>
                        <Link
                            href="/dashboard/commandes"
                            className={styles.backLink}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Retour aux commandes
                        </Link>
                        <h1 className={styles.commandesTitle}>Détails de la commande #{order.id.slice(0, 8)}</h1>
                    </div>

                    {/* Order Header */}
                    <div className={styles.commandeCard} style={{ marginBottom: '24px' }}>
                        <div className={styles.commandeCardHeader}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <div className={styles.commandeId}>#{order.id.slice(0, 8)}</div>
                                    {order.deletionRequested && (
                                        <div className={styles.deletionBadge}>
                                            Suppression demandée
                                        </div>
                                    )}
                                </div>
                                <div className={styles.statusIndicator} style={{
                                    background: getStatusColor(order.status) + '20',
                                    color: getStatusColor(order.status)
                                }}>
                                    {getStatusLabel(order.status)}
                                </div>
                            </div>
                            <div className={styles.commandeHeaderRight}>
                                <div className={styles.commandeDate}>{format(order.createdAt, "dd/MM/yyyy à HH:mm")}</div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className={styles.commandeCard} style={{ marginBottom: '24px' }}>
                        <h2 className={styles.sectionTitle}>Informations client</h2>
                        <div className={styles.commandeCardBody}>
                            <div className={styles.commandeRow}>
                                <div className={styles.commandeLabel}>Nom</div>
                                <div className={styles.commandeValue}>{order.customer.name || '-'}</div>
                            </div>
                            <div className={styles.commandeRow}>
                                <div className={styles.commandeLabel}>Téléphone</div>
                                <div className={styles.commandeValue}>{order.customer.phoneNumber}</div>
                            </div>
                            <div className={styles.commandeRow}>
                                <div className={styles.commandeLabel}>Adresse</div>
                                <div className={styles.commandeValue}>{order.customer.address || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className={styles.commandeCard} style={{ marginBottom: '24px' }}>
                        <h2 className={styles.sectionTitle}>Articles commandés</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {itemsWithImages.map((item) => (
                                <div
                                    key={item.id}
                                    className={styles.itemCard}
                                >
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.product.name}
                                            className={styles.itemImage}
                                        />
                                    )}
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemName}>
                                            {item.product.name}
                                        </div>
                                        {item.size && (
                                            <div className={styles.itemMeta}>
                                                Taille: {item.size}
                                            </div>
                                        )}
                                        {item.color && (
                                            <div className={styles.itemMeta}>
                                                Couleur: {item.color}
                                            </div>
                                        )}
                                        <div className={styles.itemMeta}>
                                            Quantité: {item.quantity}
                                        </div>
                                    </div>
                                    <div className={styles.itemPrice}>
                                        {item.price} DT
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className={styles.commandeCard}>
                        <h2 className={styles.sectionTitle}>Résumé</h2>
                        <div className={styles.commandeCardBody}>
                            <div className={styles.commandeRow}>
                                <div className={styles.commandeLabel}>Sous-total</div>
                                <div className={styles.commandeValue}>{order.totalAmount} DT</div>
                            </div>
                            <div className={`${styles.commandeRow} ${styles.totalRow}`}>
                                <div className={styles.commandeLabel} style={{ fontSize: '18px', fontWeight: 600 }}>Total</div>
                                <div className={styles.commandeTotal}>{order.totalAmount} DT</div>
                            </div>
                        </div>
                    </div>

                    {/* Note: Status updates after confirmation are admin-only */}
                    {order.status === 'PENDING' && (
                        <div className={styles.infoBox}>
                            <p style={{ margin: 0 }}>
                                Une fois confirmée, seuls les administrateurs peuvent modifier le statut de cette commande.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

