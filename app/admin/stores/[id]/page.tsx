import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { getR2Url } from "@/lib/storage";
import StoreDetailActions from "./StoreDetailActions";

export default async function AdminStoreDetailPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    // Check for admin role
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== 'ADMIN') redirect("/dashboard");

    const store = await prisma.store.findUnique({
        where: { id: params.id },
        include: {
            owner: true,
            _count: {
                select: {
                    products: true,
                    orders: true,
                    withdrawals: true
                }
            },
            products: {
                take: 5,
                orderBy: { createdAt: 'desc' }
            },
            orders: {
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: true
                }
            }
        }
    });

    if (!store) {
        notFound();
    }

    const logoUrl = store.logoUrl ? await getR2Url(store.logoUrl) : null;

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'Actif';
            case 'PENDING':
                return 'En attente';
            case 'SUSPENDED':
                return 'Suspendu';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return '#10b981';
            case 'PENDING':
                return '#f97316';
            case 'SUSPENDED':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    // Calculate total revenue
    const revenueResult = await prisma.order.aggregate({
        where: {
            storeId: store.id,
            status: { in: ['PAID', 'COMPLETED', 'SHIPPED'] }
        },
        _sum: { totalAmount: true }
    });

    const totalRevenue = revenueResult._sum.totalAmount || 0;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <Link 
                    href="/admin/stores" 
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
                    Retour aux magasins
                </Link>
                <h1 className="dash-page-title">Détails du magasin</h1>
            </div>

            {/* Store Header */}
            <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '24px', 
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {logoUrl ? (
                            <img 
                                src={logoUrl} 
                                alt={store.name}
                                style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    borderRadius: '12px',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '12px',
                                background: '#e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '32px',
                                fontWeight: 700,
                                color: '#6b7280'
                            }}>
                                {store.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                                {store.name}
                            </div>
                            <div style={{ 
                                display: 'inline-block',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                background: getStatusColor(store.status) + '20',
                                color: getStatusColor(store.status),
                                fontSize: '14px',
                                fontWeight: 600
                            }}>
                                {getStatusLabel(store.status)}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                                Slug: /{store.slug}
                            </div>
                        </div>
                    </div>
                    <StoreDetailActions storeId={store.id} currentStatus={store.status} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Store Information */}
                <div style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Informations du magasin</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Nom</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>{store.name}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Slug</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>/{store.slug}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Thème</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>{store.theme}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Date de création</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>
                                {format(store.createdAt, "dd/MM/yyyy à HH:mm")}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Dernière mise à jour</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>
                                {format(store.updatedAt, "dd/MM/yyyy à HH:mm")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Owner Information */}
                <div style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Propriétaire</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Nom</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>{store.owner.name || '-'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Email</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>{store.owner.email}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Rôle</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>{store.owner.role}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Statistiques</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                    <div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Produits</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb' }}>
                            {store._count.products}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Commandes</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                            {store._count.orders}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Revenus totaux</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#f97316' }}>
                            {totalRevenue.toFixed(2)} DT
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Retraits</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>
                            {store._count.withdrawals}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Products */}
            <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Produits récents</h2>
                    <Link 
                        href={`/admin/products?store=${store.id}`}
                        style={{ 
                            color: '#2563eb',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        Voir tout →
                    </Link>
                </div>
                {store.products.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                        Aucun produit
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {store.products.map((product) => (
                            <div 
                                key={product.id}
                                style={{ 
                                    padding: '12px',
                                    background: '#f9fafb',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                                        {product.name}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                        {product.basePrice} DT
                                    </div>
                                </div>
                                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                    {format(product.createdAt, "dd/MM/yyyy")}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Orders */}
            <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Commandes récentes</h2>
                    <Link 
                        href={`/admin/orders?store=${store.id}`}
                        style={{ 
                            color: '#2563eb',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        Voir tout →
                    </Link>
                </div>
                {store.orders.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                        Aucune commande
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {store.orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/admin/orders/${order.id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div 
                                    style={{ 
                                        padding: '12px',
                                        background: '#f9fafb',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                                >
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                                            Commande #{order.id.slice(0, 8)}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                            {order.customer.name || order.customer.phoneNumber}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#2563eb', marginBottom: '4px' }}>
                                            {order.totalAmount} DT
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                            {format(order.createdAt, "dd/MM/yyyy")}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

