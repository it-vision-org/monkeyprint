import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getR2Url } from "@/lib/storage";
import { format } from "date-fns";
import Link from "next/link";
import OrderDetailActions from "./OrderDetailActions";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stores: true }
    });

    if (!user || user.stores.length === 0) redirect("/create-shop");
    const store = user.stores[0];

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
        order.items.map(async (item) => {
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
        <div className="commandes-page">
            <div className="commandes-main">
                <div className="commandes-container">
                    <div style={{ marginBottom: '24px' }}>
                        <Link 
                            href="/dashboard/commandes" 
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
                            Retour aux commandes
                        </Link>
                        <h1 className="commandes-title">Détails de la commande #{order.id.slice(0, 8)}</h1>
                    </div>

                    {/* Order Header */}
                    <div className="commande-card" style={{ marginBottom: '24px' }}>
                        <div className="commande-card-header">
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <div className="commande-id">#{order.id.slice(0, 8)}</div>
                                    {order.deletionRequested && (
                                        <div style={{ 
                                            fontSize: '12px', 
                                            color: '#f59e0b', 
                                            padding: '4px 10px',
                                            background: '#fef3c7',
                                            borderRadius: '6px',
                                            fontWeight: 600,
                                            border: '1px solid #fde68a'
                                        }}>
                                            Suppression demandée
                                        </div>
                                    )}
                                </div>
                                <div style={{ 
                                    display: 'inline-block',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    background: getStatusColor(order.status) + '20',
                                    color: getStatusColor(order.status),
                                    fontSize: '14px',
                                    fontWeight: 600
                                }}>
                                    {getStatusLabel(order.status)}
                                </div>
                            </div>
                            <div className="commande-header-right">
                                <div className="commande-date">{format(order.createdAt, "dd/MM/yyyy à HH:mm")}</div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="commande-card" style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Informations client</h2>
                        <div className="commande-card-body">
                            <div className="commande-row">
                                <div className="commande-label">Nom</div>
                                <div className="commande-value">{order.customer.name || '-'}</div>
                            </div>
                            <div className="commande-row">
                                <div className="commande-label">Téléphone</div>
                                <div className="commande-value">{order.customer.phoneNumber}</div>
                            </div>
                            <div className="commande-row">
                                <div className="commande-label">Adresse</div>
                                <div className="commande-value">{order.customer.address || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="commande-card" style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Articles commandés</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {itemsWithImages.map((item) => (
                                <div 
                                    key={item.id} 
                                    style={{ 
                                        display: 'flex', 
                                        gap: '16px', 
                                        padding: '16px',
                                        background: '#f9fafb',
                                        borderRadius: '12px'
                                    }}
                                >
                                    {item.imageUrl && (
                                        <img 
                                            src={item.imageUrl} 
                                            alt={item.product.name}
                                            style={{ 
                                                width: '80px', 
                                                height: '80px', 
                                                objectFit: 'contain',
                                                background: 'white',
                                                borderRadius: '8px',
                                                padding: '8px'
                                            }}
                                        />
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                                            {item.product.name}
                                        </div>
                                        {item.size && (
                                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                                                Taille: {item.size}
                                            </div>
                                        )}
                                        {item.color && (
                                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                                                Couleur: {item.color}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                            Quantité: {item.quantity}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#2563eb' }}>
                                        {item.price} DT
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="commande-card">
                        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Résumé</h2>
                        <div className="commande-card-body">
                            <div className="commande-row">
                                <div className="commande-label">Sous-total</div>
                                <div className="commande-value">{order.totalAmount} DT</div>
                            </div>
                            <div className="commande-row" style={{ borderTop: '2px solid #e5e7eb', paddingTop: '12px', marginTop: '12px' }}>
                                <div className="commande-label" style={{ fontSize: '18px', fontWeight: 600 }}>Total</div>
                                <div className="commande-total">{order.totalAmount} DT</div>
                            </div>
                        </div>
                    </div>

                    {/* Note: Status updates after confirmation are admin-only */}
                    {order.status === 'PENDING' && (
                        <div style={{ 
                            marginTop: '24px', 
                            padding: '16px', 
                            background: '#f9fafb', 
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                                Une fois confirmée, seuls les administrateurs peuvent modifier le statut de cette commande.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

