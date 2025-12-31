import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminOrdersPage({
    searchParams,
}: {
    searchParams: { q?: string; status?: string; page?: string };
}) {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    const query = searchParams.q || "";
    const status = searchParams.status || "all";
    const page = parseInt(searchParams.page || "1");
    const pageSize = 10;

    const where: any = {};
    if (status !== "all") {
        where.status = status.toUpperCase();
    }
    if (query) {
        where.OR = [
            { id: { contains: query, mode: 'insensitive' } },
            { store: { name: { contains: query, mode: 'insensitive' } } },
            { customer: { name: { contains: query, mode: 'insensitive' } } },
        ];
    }

    const [orders, totalCount, statsByStatus] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                store: true,
                customer: true,
                _count: {
                    select: { orderItems: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.order.count({ where }),
        prisma.order.groupBy({
            by: ['status'],
            _count: true,
            _sum: { totalAmount: true }
        })
    ]);

    const stats = {
        total: statsByStatus.reduce((sum: number, s: any) => sum + s._count, 0),
        pending: statsByStatus.find((s: any) => s.status === 'PENDING')?._count || 0,
        paid: statsByStatus.find((s: any) => s.status === 'PAID')?._count || 0,
        revenue: statsByStatus.reduce((sum: number, s: any) => sum + (s._sum.totalAmount || 0), 0)
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'orange';
            case 'PAID': return 'blue';
            case 'SHIPPED': return 'purple';
            case 'COMPLETED': return 'green';
            case 'CANCELLED': return 'red';
            default: return 'gray';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'En attente';
            case 'PAID': return 'Payé';
            case 'SHIPPED': return 'Expédié';
            case 'COMPLETED': return 'Livré';
            case 'CANCELLED': return 'Annulé';
            default: return status;
        }
    };

    return (
        <>
            <div className="admin-orders-header">
                <h1 className="dash-page-title">Gestion des Commandes</h1>
                <div className="admin-orders-actions">
                    <button className="admin-export-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Exporter
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-orders-stats">
                <div className="admin-orders-stat-card">
                    <div className="admin-orders-stat-value">{stats.total}</div>
                    <div className="admin-orders-stat-label">Total Commandes</div>
                </div>
                <div className="admin-orders-stat-card">
                    <div className="admin-orders-stat-value">{stats.pending}</div>
                    <div className="admin-orders-stat-label">En attente</div>
                </div>
                <div className="admin-orders-stat-card">
                    <div className="admin-orders-stat-value">{stats.paid}</div>
                    <div className="admin-orders-stat-label">Payées</div>
                </div>
                <div className="admin-orders-stat-card">
                    <div className="admin-orders-stat-value">{stats.revenue.toLocaleString()} DT</div>
                    <div className="admin-orders-stat-label">Revenus Totaux</div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-orders-filters">
                <form className="admin-search-bar" action="/admin/orders">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                        name="q"
                        type="text"
                        placeholder="Rechercher par ID, magasin ou client..."
                        defaultValue={query}
                    />
                    <input type="hidden" name="status" value={status} />
                </form>

                <div className="admin-filter-tabs">
                    <Link href={`/admin/orders?status=all&q=${query}`} className={`admin-filter-tab ${status === 'all' ? 'active' : ''}`}>
                        Toutes ({stats.total})
                    </Link>
                    <Link href={`/admin/orders?status=pending&q=${query}`} className={`admin-filter-tab ${status === 'pending' ? 'active' : ''}`}>
                        En attente ({stats.pending})
                    </Link>
                    <Link href={`/admin/orders?status=paid&q=${query}`} className={`admin-filter-tab ${status === 'paid' ? 'active' : ''}`}>
                        Payées ({stats.paid})
                    </Link>
                </div>
            </div>

            {/* Orders Table */}
            <div className="admin-orders-table-wrapper">
                <table className="admin-orders-table">
                    <thead>
                        <tr>
                            <th>ID Commande</th>
                            <th>Magasin</th>
                            <th>Client</th>
                            <th>Articles</th>
                            <th>Montant</th>
                            <th>Statut</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Aucune commande trouvée</td>
                            </tr>
                        ) : (
                            orders.map((order: any) => (
                                <tr key={order.id}>
                                    <td className="admin-order-id">{order.id.substring(0, 8)}</td>
                                    <td>{order.store.name}</td>
                                    <td>{order.customer.name}</td>
                                    <td>{order._count.orderItems}</td>
                                    <td className="admin-order-amount">{order.totalAmount} DT</td>
                                    <td>
                                        <span className={`admin-status-badge ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="admin-action-buttons">
                                            {/* Action buttons */}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="admin-pagination">
                {page > 1 && (
                    <Link href={`/admin/orders?page=${page - 1}&q=${query}&status=${status}`} className="admin-pagination-btn">
                        &lt; Précédent
                    </Link>
                )}
                <div className="admin-pagination-numbers">
                    {[...Array(Math.ceil(totalCount / pageSize))].map((_, i) => (
                        <Link
                            key={i}
                            href={`/admin/orders?page=${i + 1}&q=${query}&status=${status}`}
                            className={`admin-pagination-number ${page === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </Link>
                    ))}
                </div>
                {page < Math.ceil(totalCount / pageSize) && (
                    <Link href={`/admin/orders?page=${page + 1}&q=${query}&status=${status}`} className="admin-pagination-btn">
                        Suivant &gt;
                    </Link>
                )}
            </div>
        </>
    );
}

