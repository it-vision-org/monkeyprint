import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import AdminSupportTableRow from "./AdminSupportTableRow";

export default async function AdminSupportPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; priority?: string; q?: string; page?: string }>;
}) {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== 'ADMIN') redirect("/dashboard");

    const resolvedParams = await searchParams;
    const statusFilter = resolvedParams.status || "all";
    const priorityFilter = resolvedParams.priority || "all";
    const query = resolvedParams.q || "";
    const page = parseInt(resolvedParams.page || "1");
    const pageSize = 20;

    const where: any = {};
    
    if (statusFilter !== "all") {
        where.status = statusFilter.toUpperCase();
    }
    
    if (priorityFilter !== "all") {
        where.priority = priorityFilter.toUpperCase();
    }
    
    if (query) {
        where.OR = [
            { subject: { contains: query, mode: 'insensitive' } },
            { user: { email: { contains: query, mode: 'insensitive' } } },
        ];
    }

    const [tickets, totalCount] = await Promise.all([
        prisma.supportTicket.findMany({
            where,
            include: {
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                _count: {
                    select: {
                        messages: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.supportTicket.count({ where })
    ]);

    // Get stats
    const stats = await prisma.supportTicket.groupBy({
        by: ['status'],
        _count: true
    });

    const statsMap: Record<string, number> = {
        OPEN: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0,
        CLOSED: 0
    };

    stats.forEach((stat: any) => {
        statsMap[stat.status] = stat._count;
    });

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'OPEN':
                return { label: 'Ouvert', color: '#f59e0b', emoji: '🔓', bgColor: '#fef3c7' };
            case 'IN_PROGRESS':
                return { label: 'En cours', color: '#3b82f6', emoji: '⚙️', bgColor: '#dbeafe' };
            case 'RESOLVED':
                return { label: 'Résolu', color: '#10b981', emoji: '✅', bgColor: '#d1fae5' };
            case 'CLOSED':
                return { label: 'Fermé', color: '#6b7280', emoji: '🔒', bgColor: '#f3f4f6' };
            default:
                return { label: status, color: '#6b7280', emoji: '❓', bgColor: '#f3f4f6' };
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT':
                return '#ef4444';
            case 'HIGH':
                return '#f97316';
            case 'NORMAL':
                return '#3b82f6';
            case 'LOW':
                return '#6b7280';
            default:
                return '#6b7280';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'URGENT':
                return 'Urgent';
            case 'HIGH':
                return 'Élevée';
            case 'NORMAL':
                return 'Normale';
            case 'LOW':
                return 'Basse';
            default:
                return priority;
        }
    };

    return (
        <>
            <h1 className="dash-page-title">Support Tickets</h1>

            {/* Stats Cards */}
            <div className="admin-orders-stats">
                <div className="admin-orders-stat-card">
                    <div className="admin-orders-stat-value">{totalCount}</div>
                    <div className="admin-orders-stat-label">Total Tickets</div>
                </div>
                <div className="admin-orders-stat-card">
                    <div className="admin-orders-stat-value">{statsMap.OPEN}</div>
                    <div className="admin-orders-stat-label">Ouverts</div>
                </div>
                <div className="admin-orders-stat-card">
                    <div className="admin-orders-stat-value">{statsMap.IN_PROGRESS}</div>
                    <div className="admin-orders-stat-label">En cours</div>
                </div>
                <div className="admin-orders-stat-card">
                    <div className="admin-orders-stat-value">{statsMap.RESOLVED}</div>
                    <div className="admin-orders-stat-label">Résolus</div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-orders-filters">
                <form className="admin-search-bar" action="/admin/support">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                        name="q"
                        type="text"
                        placeholder="Rechercher par sujet ou email..."
                        defaultValue={query}
                    />
                    <input type="hidden" name="status" value={statusFilter} />
                    <input type="hidden" name="priority" value={priorityFilter} />
                </form>

                <div className="admin-filter-tabs">
                    <Link href={`/admin/support?status=all&priority=${priorityFilter}&q=${query}`} className={`admin-filter-tab ${statusFilter === 'all' ? 'active' : ''}`}>
                        Tous ({totalCount})
                    </Link>
                    <Link href={`/admin/support?status=open&priority=${priorityFilter}&q=${query}`} className={`admin-filter-tab ${statusFilter === 'open' ? 'active' : ''}`}>
                        Ouverts ({statsMap.OPEN})
                    </Link>
                    <Link href={`/admin/support?status=in_progress&priority=${priorityFilter}&q=${query}`} className={`admin-filter-tab ${statusFilter === 'in_progress' ? 'active' : ''}`}>
                        En cours ({statsMap.IN_PROGRESS})
                    </Link>
                    <Link href={`/admin/support?status=resolved&priority=${priorityFilter}&q=${query}`} className={`admin-filter-tab ${statusFilter === 'resolved' ? 'active' : ''}`}>
                        Résolus ({statsMap.RESOLVED})
                    </Link>
                    <Link href={`/admin/support?status=closed&priority=${priorityFilter}&q=${query}`} className={`admin-filter-tab ${statusFilter === 'closed' ? 'active' : ''}`}>
                        Fermés ({statsMap.CLOSED})
                    </Link>
                </div>
            </div>

            {/* Tickets Table */}
            <div className="admin-orders-table-wrapper">
                <table className="admin-orders-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Sujet</th>
                            <th>Utilisateur</th>
                            <th>Priorité</th>
                            <th>Statut</th>
                            <th>Messages</th>
                            <th>Dernière mise à jour</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '40px 20px' }}>
                                    <div style={{ color: '#6b7280', fontSize: '15px' }}>Aucun ticket trouvé</div>
                                </td>
                            </tr>
                        ) : (
                            tickets.map((ticket: any) => (
                                <AdminSupportTableRow key={ticket.id} ticket={ticket} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalCount > pageSize && (
                <div className="admin-pagination">
                    {page > 1 && (
                        <Link href={`/admin/support?page=${page - 1}&q=${query}&status=${statusFilter}&priority=${priorityFilter}`} className="admin-pagination-btn">
                            &lt; Précédent
                        </Link>
                    )}
                    <div className="admin-pagination-numbers">
                        {[...Array(Math.ceil(totalCount / pageSize))].map((_, i) => (
                            <Link
                                key={i}
                                href={`/admin/support?page=${i + 1}&q=${query}&status=${statusFilter}&priority=${priorityFilter}`}
                                className={`admin-pagination-number ${page === i + 1 ? 'active' : ''}`}
                            >
                                {i + 1}
                            </Link>
                        ))}
                    </div>
                    {page < Math.ceil(totalCount / pageSize) && (
                        <Link href={`/admin/support?page=${page + 1}&q=${query}&status=${statusFilter}&priority=${priorityFilter}`} className="admin-pagination-btn">
                            Suivant &gt;
                        </Link>
                    )}
                </div>
            )}
        </>
    );
}
