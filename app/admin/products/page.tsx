import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getR2Url } from "@/lib/storage";
import AdminProductTableRow from "./AdminProductTableRow";

export default async function AdminProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; store?: string; page?: string }>;
}) {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    // Check for admin role
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== 'ADMIN') redirect("/dashboard");

    const resolvedParams = await searchParams;
    const query = resolvedParams.q || "";
    const storeFilter = resolvedParams.store || "all";
    const page = parseInt(resolvedParams.page || "1");
    const pageSize = 20;

    const where: any = {};
    if (storeFilter !== "all") {
        where.storeId = storeFilter;
    }
    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { store: { name: { contains: query, mode: 'insensitive' } } },
        ];
    }

    const [products, totalCount, statsByProduct, stores] = await Promise.all([
        prisma.product.findMany({
            where,
            select: {
                id: true,
                name: true,
                description: true,
                basePrice: true,
                createdAt: true,
                previewFront: true,
                store: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                _count: {
                    select: {
                        orderItems: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.product.count({ where }),
        prisma.orderItem.aggregate({
            _sum: { quantity: true },
        }),
        prisma.store.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: { name: 'asc' },
        })
    ]);

    const totalSold = statsByProduct._sum.quantity || 0;

    // Resolve image URLs for products
    const productsWithImages = await Promise.all(
        products.map(async (product: typeof products[number]) => {
            const imageUrl = product.previewFront ? await getR2Url(product.previewFront) : null;
            return { ...product, imageUrl };
        })
    );

    // Count products by store for filter tabs
    const productCountsByStore = await Promise.all(
        stores.map(async (store) => {
            const count = await prisma.product.count({
                where: { storeId: store.id },
            });
            return { ...store, count };
        })
    );

    const allProductsCount = await prisma.product.count();

    return (
        <>
            <div className="admin-products-header">
                <h1 className="dash-page-title">Gestion des Produits</h1>
                <div className="admin-products-actions">
                    <a 
                        href={`/api/admin/products/export?${storeFilter !== 'all' ? `store=${storeFilter}&` : ''}${query ? `q=${encodeURIComponent(query)}` : ''}`}
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
            <div className="admin-products-stats">
                <div className="admin-products-stat-card">
                    <div className="admin-products-stat-value">{totalCount}</div>
                    <div className="admin-products-stat-label">Total Produits</div>
                </div>
                <div className="admin-products-stat-card">
                    <div className="admin-products-stat-value">{totalSold.toLocaleString()}</div>
                    <div className="admin-products-stat-label">Produits Vendus</div>
                </div>
                <div className="admin-products-stat-card">
                    <div className="admin-products-stat-value">{stores.length}</div>
                    <div className="admin-products-stat-label">Magasins</div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-products-filters">
                <form className="admin-search-bar" action="/admin/products" style={{ display: 'flex', gap: '12px', flex: 1 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                        name="q"
                        type="text"
                        placeholder="Rechercher par nom ou magasin..."
                        defaultValue={query}
                        style={{ flex: 1 }}
                    />
                    <input type="hidden" name="store" value={storeFilter} />
                </form>

                <div className="admin-filter-tabs">
                    <Link
                        href={`/admin/products?store=all&q=${query}`}
                        className={`admin-filter-tab ${storeFilter === 'all' ? 'active' : ''}`}
                    >
                        Tous ({allProductsCount})
                    </Link>
                    {productCountsByStore.slice(0, 5).map((store) => (
                        <Link
                            key={store.id}
                            href={`/admin/products?store=${store.id}&q=${query}`}
                            className={`admin-filter-tab ${storeFilter === store.id ? 'active' : ''}`}
                        >
                            {store.name} ({store.count})
                        </Link>
                    ))}
                    {stores.length > 5 && (
                        <form action="/admin/products" method="get" style={{ display: 'inline' }}>
                            <input type="hidden" name="q" value={query} />
                            <select
                                name="store"
                                onChange={(e) => e.target.form?.submit()}
                                value={storeFilter !== 'all' && !productCountsByStore.slice(0, 5).some(s => s.id === storeFilter) ? storeFilter : 'all'}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid #e5e7eb',
                                    background: 'white',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                }}
                            >
                                <option value="all">Autres magasins...</option>
                                {stores.slice(5).map((store) => (
                                    <option key={store.id} value={store.id}>
                                        {store.name} ({productCountsByStore.find(s => s.id === store.id)?.count || 0})
                                    </option>
                                ))}
                            </select>
                        </form>
                    )}
                </div>
            </div>

            {/* Products Table */}
            <div className="admin-products-table-wrapper">
                <table className="admin-products-table">
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Magasin</th>
                            <th>Prix</th>
                            <th>Vendus</th>
                            <th>Date de création</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productsWithImages.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px' }}>
                                    <div style={{ color: '#6b7280', fontSize: '15px' }}>Aucun produit trouvé</div>
                                </td>
                            </tr>
                        ) : (
                            productsWithImages.map((product: any) => (
                                <AdminProductTableRow key={product.id} product={product} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="admin-pagination">
                {page > 1 && (
                    <Link href={`/admin/products?page=${page - 1}&q=${query}&store=${storeFilter}`} className="admin-pagination-btn">
                        &lt; Précédent
                    </Link>
                )}
                <div className="admin-pagination-numbers">
                    {[...Array(Math.ceil(totalCount / pageSize))].map((_, i) => (
                        <Link
                            key={i}
                            href={`/admin/products?page=${i + 1}&q=${query}&store=${storeFilter}`}
                            className={`admin-pagination-number ${page === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </Link>
                    ))}
                </div>
                {page < Math.ceil(totalCount / pageSize) && (
                    <Link href={`/admin/products?page=${page + 1}&q=${query}&store=${storeFilter}`} className="admin-pagination-btn">
                        Suivant &gt;
                    </Link>
                )}
            </div>
        </>
    );
}

