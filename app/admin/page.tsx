import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminDashboardPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    // Check for admin role
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== 'ADMIN') redirect("/dashboard");

    const [
        storeCount,
        userCount,
        customerCount,
        orderCount,
        recentStores,
        recentOrders,
        totalRevenue
    ] = await Promise.all([
        prisma.store.count(),
        prisma.user.count(), // Store owners
        prisma.customer.count(), // End customers
        prisma.order.count(),
        prisma.store.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { owner: true }
        }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { store: true }
        }),
        prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { status: { in: ['CONFIRMED', 'IN_TREATMENT', 'IN_DELIVERY', 'DELIVERED_AND_PAID'] } }
        })
    ]);

    const totalUsers = userCount + customerCount;
    const revenue = totalRevenue._sum.totalAmount || 0;

    return (
        <>
            <h1 className="dash-page-title">Tableau de bord Admin</h1>

            {/* Stats Grid */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-content">
                        <div className="admin-stat-text">
                            <div className="admin-stat-label">Total des Magasins</div>
                            <div className="admin-stat-value">{storeCount}</div>
                            <div className="admin-stat-change positive">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Actifs
                            </div>
                        </div>
                        <div className="admin-stat-icon blue">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 22V12H15V22" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-content">
                        <div className="admin-stat-text">
                            <div className="admin-stat-label">Total des Utilisateurs</div>
                            <div className="admin-stat-value">{totalUsers}</div>
                            <div className="admin-stat-change positive">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {userCount} Vendeurs
                            </div>
                        </div>
                        <div className="admin-stat-icon green">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-content">
                        <div className="admin-stat-text">
                            <div className="admin-stat-label">Commandes Totales</div>
                            <div className="admin-stat-value">{orderCount}</div>
                            <div className="admin-stat-change positive">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Global
                            </div>
                        </div>
                        <div className="admin-stat-icon purple">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <rect x="9" y="3" width="6" height="4" rx="1" stroke="#8b5cf6" strokeWidth="2" />
                                <path d="M9 12H15" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
                                <path d="M9 16H15" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-content">
                        <div className="admin-stat-text">
                            <div className="admin-stat-label">Revenus Totaux</div>
                            <div className="admin-stat-value">{revenue.toFixed(2)}</div>
                            <div className="admin-stat-currency">DT</div>
                            <div className="admin-stat-change positive">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Encaissé
                            </div>
                        </div>
                        <div className="admin-stat-icon orange">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="admin-activity-section">
                <h2 className="admin-section-title">Activité récente</h2>

                <div className="admin-activity-grid">
                    {/* Recent Stores */}
                    <div className="admin-activity-card">
                        <div className="admin-activity-header">
                            <h3 className="admin-activity-title">Nouveaux Magasins</h3>
                            <Link href="/admin/stores" className="admin-activity-link">Voir tout →</Link>
                        </div>
                        <div className="admin-activity-list">
                            {recentStores.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">Aucun magasin récent</div>
                            ) : (
                                recentStores.map((store: any) => (
                                    <div key={store.id} className="admin-activity-item">
                                        <div className="admin-activity-item-content">
                                            <div className="admin-activity-item-name">{store.name}</div>
                                            <div className="admin-activity-item-detail">{store.owner.name || store.owner.email}</div>
                                            <div className="admin-activity-item-date">{new Date(store.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className={`admin-activity-badge ${store.status === 'ACTIVE' ? 'active' : store.status === 'PENDING' ? 'pending' : 'suspended'}`}>
                                            {store.status === 'ACTIVE' ? 'Actif' : store.status === 'PENDING' ? 'En attente' : 'Suspendu'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="admin-activity-card">
                        <div className="admin-activity-header">
                            <h3 className="admin-activity-title">Commandes Récentes</h3>
                            <Link href="/admin/orders" className="admin-activity-link">Voir tout →</Link>
                        </div>
                        <div className="admin-activity-list">
                            {recentOrders.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">Aucune commande récente</div>
                            ) : (
                                recentOrders.map((order: any) => (
                                    <div key={order.id} className="admin-activity-item">
                                        <div className="admin-activity-item-content">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="admin-activity-item-name">{order.id.substring(0, 8)}</div>
                                                {order.deletionRequested && (
                                                    <span style={{ 
                                                        fontSize: '9px', 
                                                        color: '#f59e0b', 
                                                        padding: '2px 6px',
                                                        background: '#fef3c7',
                                                        borderRadius: '4px',
                                                        fontWeight: 600,
                                                        border: '1px solid #fde68a',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        Suppression demandée
                                                    </span>
                                                )}
                                            </div>
                                            <div className="admin-activity-item-detail">{order.store.name}</div>
                                            <div className="admin-activity-item-date">{new Date(order.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className="admin-activity-item-amount">{order.totalAmount} DT</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

