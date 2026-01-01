import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import UserDetailActions from "./UserDetailActions";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    // Check for admin role
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== 'ADMIN') redirect("/dashboard");

    const targetUser = await prisma.user.findUnique({
        where: { id },
        include: {
            stores: {
                include: {
                    _count: {
                        select: {
                            products: true,
                            orders: true
                        }
                    }
                }
            }
        }
    });

    if (!targetUser) {
        notFound();
    }

    // Calculate total revenue across all stores
    let totalRevenue = 0;
    for (const store of targetUser.stores) {
        const revenueResult = await prisma.order.aggregate({
            where: {
                storeId: store.id,
                status: { in: ['CONFIRMED', 'IN_TREATMENT', 'IN_DELIVERY', 'DELIVERED_AND_PAID'] }
            },
            _sum: { totalAmount: true }
        });
        totalRevenue += revenueResult._sum.totalAmount || 0;
    }

    const totalOrders = await prisma.order.count({
        where: {
            store: {
                ownerId: targetUser.id
            }
        }
    });

    const totalProducts = await prisma.product.count({
        where: {
            store: {
                ownerId: targetUser.id
            }
        }
    });

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'Administrateur';
            case 'USER':
                return 'Utilisateur';
            default:
                return role;
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <Link 
                    href="/admin/users" 
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
                    Retour aux utilisateurs
                </Link>
                <h1 className="dash-page-title">Détails de l&apos;utilisateur</h1>
            </div>

            {/* User Header */}
            <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '24px', 
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            fontWeight: 700,
                            color: 'white'
                        }}>
                            {(targetUser.name || targetUser.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                                {targetUser.name || targetUser.email}
                            </div>
                            <div style={{ 
                                display: 'inline-block',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                background: targetUser.role === 'ADMIN' ? '#ef444420' : '#2563eb20',
                                color: targetUser.role === 'ADMIN' ? '#ef4444' : '#2563eb',
                                fontSize: '14px',
                                fontWeight: 600
                            }}>
                                {getRoleLabel(targetUser.role)}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                                {targetUser.email}
                            </div>
                        </div>
                    </div>
                    {targetUser.id !== user.id && (
                        <UserDetailActions userId={targetUser.id} currentRole={targetUser.role} />
                    )}
                </div>
            </div>

            {/* User Information */}
            <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Informations</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Nom</div>
                        <div style={{ fontSize: '16px', fontWeight: 500 }}>{targetUser.name || '-'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Email</div>
                        <div style={{ fontSize: '16px', fontWeight: 500 }}>{targetUser.email}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Rôle</div>
                        <div style={{ fontSize: '16px', fontWeight: 500 }}>{getRoleLabel(targetUser.role)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Date d&apos;inscription</div>
                        <div style={{ fontSize: '16px', fontWeight: 500 }}>
                            {format(targetUser.createdAt, "dd/MM/yyyy à HH:mm")}
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
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Magasins</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb' }}>
                            {targetUser.stores.length}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Produits</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                            {totalProducts}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Commandes</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#f97316' }}>
                            {totalOrders}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Revenus totaux</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>
                            {totalRevenue.toFixed(2)} DT
                        </div>
                    </div>
                </div>
            </div>

            {/* Stores */}
            <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Magasins</h2>
                {targetUser.stores.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                        Aucun magasin
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {targetUser.stores.map((store) => (
                            <Link
                                key={store.id}
                                href={`/admin/stores/${store.id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div 
                                    style={{ 
                                        padding: '16px',
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
                                            {store.name}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                            /shop/{store.slug}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Produits</div>
                                            <div style={{ fontSize: '16px', fontWeight: 600 }}>{store._count.products}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Commandes</div>
                                            <div style={{ fontSize: '16px', fontWeight: 600 }}>{store._count.orders}</div>
                                        </div>
                                        <div style={{ 
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            background: store.status === 'ACTIVE' ? '#10b98120' : store.status === 'SUSPENDED' ? '#ef444420' : '#f9731620',
                                            color: store.status === 'ACTIVE' ? '#10b981' : store.status === 'SUSPENDED' ? '#ef4444' : '#f97316',
                                            fontSize: '14px',
                                            fontWeight: 600
                                        }}>
                                            {store.status === 'ACTIVE' ? 'Actif' : store.status === 'SUSPENDED' ? 'Suspendu' : 'En attente'}
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

