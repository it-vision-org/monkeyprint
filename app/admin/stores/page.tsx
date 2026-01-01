import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function AdminStoresPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    // Check for admin role
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== 'ADMIN') redirect("/dashboard");

    const resolvedParams = await searchParams;
    const query = resolvedParams.q || "";
    const status = resolvedParams.status || "all";
    const page = parseInt(resolvedParams.page || "1");
    const pageSize = 10;

    const where: any = {};
    if (status !== "all") {
        where.status = status.toUpperCase();
    }
    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { slug: { contains: query, mode: 'insensitive' } },
            { owner: { email: { contains: query, mode: 'insensitive' } } },
            { owner: { name: { contains: query, mode: 'insensitive' } } },
        ];
    }

    const [stores, totalCount] = await Promise.all([
        prisma.store.findMany({
            where,
            include: {
                owner: true,
                _count: {
                    select: { products: true, orders: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.store.count({ where })
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'green';
            case 'PENDING':
                return 'orange';
            case 'SUSPENDED':
                return 'red';
            default:
                return 'gray';
        }
    };

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

    return (
        <>
            <div className="admin-stores-header">
                <h1 className="dash-page-title">Gestion des Magasins</h1>
                <div className="admin-stores-actions">
                    <a 
                        href={`/api/admin/stores/export?${status !== 'all' ? `status=${status}&` : ''}${query ? `q=${encodeURIComponent(query)}` : ''}`}
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

            {/* Filters */}
            <div className="admin-stores-filters">
                <form className="admin-search-bar" action="/admin/stores">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                        name="q"
                        type="text"
                        placeholder="Rechercher par nom, propriétaire ou email..."
                        defaultValue={query}
                    />
                    <input type="hidden" name="status" value={status} />
                </form>

                <div className="admin-filter-tabs">
                    <Link
                        href={`/admin/stores?status=all&q=${query}`}
                        className={`admin-filter-tab ${status === 'all' ? 'active' : ''}`}
                    >
                        Tous ({totalCount})
                    </Link>
                    <Link
                        href={`/admin/stores?status=active&q=${query}`}
                        className={`admin-filter-tab ${status === 'active' ? 'active' : ''}`}
                    >
                        Actifs
                    </Link>
                </div>
            </div>

            {/* Stores Table */}
            <div className="admin-stores-table-wrapper">
                <table className="admin-stores-table">
                    <thead>
                        <tr>
                            <th>Magasin</th>
                            <th>Propriétaire</th>
                            <th>Statut</th>
                            <th>Produits</th>
                            <th>Commandes</th>
                            <th>Date de création</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stores.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Aucun magasin trouvé</td>
                            </tr>
                        ) : (
                            stores.map((store: any) => (
                                <tr key={store.id}>
                                    <td>
                                        <div className="admin-store-cell">
                                            <div className="admin-store-avatar">
                                                <span>{store.name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <div className="admin-store-name">{store.name}</div>
                                                <div className="admin-store-email">{store.owner.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{store.owner.name || store.owner.email}</td>
                                    <td>
                                        <span className={`admin-status-badge ${getStatusColor(store.status)}`}>
                                            {getStatusLabel(store.status)}
                                        </span>
                                    </td>
                                    <td>{store._count.products}</td>
                                    <td>{store._count.orders}</td>
                                    <td>{new Date(store.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="admin-action-buttons">
                                            <Link href={`/admin/stores/${store.id}`} className="admin-action-btn view" title="Voir détails">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </Link>
                                            <Link href={`/${store.slug}`} target="_blank" className="admin-action-btn view" title="Voir la boutique">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M18 13V19A2 2 0 0 1 16 21H5A2 2 0 0 1 3 19V8A2 2 0 0 1 5 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                    <Link href={`/admin/stores?page=${page - 1}&q=${query}&status=${status}`} className="admin-pagination-btn">
                        &lt; Précédent
                    </Link>
                )}
                <div className="admin-pagination-numbers">
                    {[...Array(Math.ceil(totalCount / pageSize))].map((_, i) => (
                        <Link
                            key={i}
                            href={`/admin/stores?page=${i + 1}&q=${query}&status=${status}`}
                            className={`admin-pagination-number ${page === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </Link>
                    ))}
                </div>
                {page < Math.ceil(totalCount / pageSize) && (
                    <Link href={`/admin/stores?page=${page + 1}&q=${query}&status=${status}`} className="admin-pagination-btn">
                        Suivant &gt;
                    </Link>
                )}
            </div>
        </>
    );
}

