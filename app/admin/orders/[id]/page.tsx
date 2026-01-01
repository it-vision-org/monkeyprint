import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getR2Url } from "@/lib/storage";
import { format } from "date-fns";
import Link from "next/link";
import AdminOrderActions from "./AdminOrderActions";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    // Check for admin role
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== 'ADMIN') redirect("/dashboard");

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            customer: true,
            store: {
                include: {
                    owner: true
                }
            },
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!order) {
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
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <Link 
                    href="/admin/orders" 
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
                <h1 className="dash-page-title">Détails de la commande #{order.id.slice(0, 8)}</h1>
            </div>


            {/* Order Header */}
            <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '24px', 
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700 }}>
                                #{order.id.slice(0, 8)}
                            </div>
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
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                            Date de commande
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 600 }}>
                            {format(order.createdAt, "dd/MM/yyyy à HH:mm")}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Customer Information */}
                <div style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Informations client</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Nom</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>{order.customer.name || '-'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Téléphone</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>{order.customer.phoneNumber}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Adresse</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>{order.customer.address || '-'}</div>
                        </div>
                    </div>
                </div>

                {/* Store Information */}
                <div style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Informations magasin</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Nom du magasin</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>{order.store.name}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Propriétaire</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>{order.store.owner.name || order.store.owner.email}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Email</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>{order.store.owner.email}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
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
            <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Résumé</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '16px', color: '#6b7280' }}>Sous-total</div>
                        <div style={{ fontSize: '16px', fontWeight: 500 }}>{order.totalAmount} DT</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px' }}>
                        <div style={{ fontSize: '20px', fontWeight: 700 }}>Total</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>{order.totalAmount} DT</div>
                    </div>
                </div>
            </div>

            {/* Admin Actions */}
            <div style={{ marginTop: '24px' }}>
                <AdminOrderActions orderId={order.id} currentStatus={order.status} />
            </div>
        </div>
    );
}

