import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: { q?: string; role?: string; page?: string };
}) {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    // Check for admin role
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== 'ADMIN') redirect("/dashboard");

    const query = searchParams.q || "";
    const role = searchParams.role || "all";
    const page = parseInt(searchParams.page || "1");
    const pageSize = 10;

    const where: any = {};
    if (role !== "all") {
        where.role = role.toUpperCase();
    }
    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
        ];
    }

    const [users, totalCount, userStats] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                _count: {
                    select: { stores: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.user.count({ where }),
        prisma.user.groupBy({
            by: ['role'],
            _count: true,
        })
    ]);

    const stats = {
        total: userStats.reduce((sum: number, s: any) => sum + s._count, 0),
        admins: userStats.find((s: any) => s.role === 'ADMIN')?._count || 0,
        users: userStats.find((s: any) => s.role === 'USER')?._count || 0,
    };

    return (
        <>
            <div className="admin-users-header">
                <h1 className="dash-page-title">Gestion des Utilisateurs</h1>
                <div className="admin-users-actions">
                    <a 
                        href={`/api/admin/users/export?${role !== 'all' ? `role=${role}&` : ''}${query ? `q=${encodeURIComponent(query)}` : ''}`}
                        className="admin-export-btn"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Exporter
                    </a>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-users-stats">
                <div className="admin-users-stat-card">
                    <div className="admin-users-stat-value">{stats.total}</div>
                    <div className="admin-users-stat-label">Total Utilisateurs</div>
                </div>
                <div className="admin-users-stat-card">
                    <div className="admin-users-stat-value">{stats.users}</div>
                    <div className="admin-users-stat-label">Vendeurs</div>
                </div>
                <div className="admin-users-stat-card">
                    <div className="admin-users-stat-value">{stats.admins}</div>
                    <div className="admin-users-stat-label">Admins</div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-users-filters">
                <form className="admin-search-bar" action="/admin/users">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                        name="q"
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        defaultValue={query}
                    />
                    <input type="hidden" name="role" value={role} />
                </form>

                <div className="admin-filter-tabs">
                    <Link
                        href={`/admin/users?role=all&q=${query}`}
                        className={`admin-filter-tab ${role === 'all' ? 'active' : ''}`}
                    >
                        Tous ({stats.total})
                    </Link>
                    <Link
                        href={`/admin/users?role=user&q=${query}`}
                        className={`admin-filter-tab ${role === 'user' ? 'active' : ''}`}
                    >
                        Vendeurs ({stats.users})
                    </Link>
                    <Link
                        href={`/admin/users?role=admin&q=${query}`}
                        className={`admin-filter-tab ${role === 'admin' ? 'active' : ''}`}
                    >
                        Admins ({stats.admins})
                    </Link>
                </div>
            </div>

            {/* Users Table */}
            <div className="admin-users-table-wrapper">
                <table className="admin-users-table">
                    <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Magasins</th>
                            <th>Date d'inscription</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Aucun utilisateur trouvé</td>
                            </tr>
                        ) : (
                            users.map((user: any) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="admin-user-cell">
                                            <div className="admin-user-avatar">
                                                <span>{(user.name || user.email).charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div className="admin-user-name">{user.name || 'Sans nom'}</div>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`admin-role-badge ${user.role === 'ADMIN' ? 'owner' : 'customer'}`}>
                                            {user.role === 'ADMIN' ? 'Admin' : 'Vendeur'}
                                        </span>
                                    </td>
                                    <td>{user._count.stores}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className="admin-status-badge green">
                                            Actif
                                        </span>
                                    </td>
                                    <td>
                                        <div className="admin-action-buttons">
                                            <Link href={`/admin/users/${user.id}`} className="admin-action-btn view" title="Voir détails">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </Link>
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
                    <Link href={`/admin/users?page=${page - 1}&q=${query}&role=${role}`} className="admin-pagination-btn">
                        &lt; Précédent
                    </Link>
                )}
                <div className="admin-pagination-numbers">
                    {[...Array(Math.ceil(totalCount / pageSize))].map((_, i) => (
                        <Link
                            key={i}
                            href={`/admin/users?page=${i + 1}&q=${query}&role=${role}`}
                            className={`admin-pagination-number ${page === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </Link>
                    ))}
                </div>
                {page < Math.ceil(totalCount / pageSize) && (
                    <Link href={`/admin/users?page=${page + 1}&q=${query}&role=${role}`} className="admin-pagination-btn">
                        Suivant &gt;
                    </Link>
                )}
            </div>
        </>
    );
}

