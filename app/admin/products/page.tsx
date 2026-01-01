import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function AdminProductsPage({
    searchParams,
}: {
    searchParams: { q?: string; page?: string };
}) {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    // Check for admin role
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== 'ADMIN') redirect("/dashboard");

    const query = searchParams.q || "";
    const page = parseInt(searchParams.page || "1");
    const pageSize = 12;

    const where: any = {};
    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { store: { name: { contains: query, mode: 'insensitive' } } },
        ];
    }

    const [products, totalCount, statsByProduct] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                store: true,
                _count: {
                    select: { orderItems: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.product.count({ where }),
        prisma.orderItem.aggregate({
            _sum: { quantity: true },
        })
    ]);

    const totalSold = statsByProduct._sum.quantity || 0;

    return (
        <>
            <div className="admin-products-header">
                <h1 className="dash-page-title">Gestion des Produits</h1>
                <div className="admin-products-actions">
                    <a 
                        href={`/api/admin/products/export${query ? `?q=${encodeURIComponent(query)}` : ''}`}
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
            </div>

            {/* Search */}
            <div className="admin-products-filters">
                <form className="admin-search-bar" action="/admin/products">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                        name="q"
                        type="text"
                        placeholder="Rechercher par nom ou magasin..."
                        defaultValue={query}
                    />
                </form>
            </div>

            {/* Products Grid */}
            <div className="admin-products-grid">
                {products.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 w-full">Aucun produit trouvé</div>
                ) : (
                    products.map((product: any) => (
                        <div key={product.id} className="admin-product-card">
                            <div className="admin-product-image">
                                <Image
                                    src={product.previewFront || "/T-Shirt.png"}
                                    alt={product.name}
                                    width={200}
                                    height={200}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                            <div className="admin-product-info">
                                <div className="admin-product-name">{product.name}</div>
                                <div className="admin-product-store">{product.store.name}</div>
                                <div className="admin-product-price">{product.basePrice} DT</div>
                                <div className="admin-product-stats">
                                    <span>Vendu: {product._count.orderItems}</span>
                                </div>
                                <div className="admin-product-actions">
                                    <Link href={`/${product.store.slug}/products/${product.id}`} className="admin-product-action-btn view">Voir</Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="admin-pagination">
                {page > 1 && (
                    <Link href={`/admin/products?page=${page - 1}&q=${query}`} className="admin-pagination-btn">
                        &lt; Précédent
                    </Link>
                )}
                <div className="admin-pagination-numbers">
                    {[...Array(Math.ceil(totalCount / pageSize))].map((_, i) => (
                        <Link
                            key={i}
                            href={`/admin/products?page=${i + 1}&q=${query}`}
                            className={`admin-pagination-number ${page === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </Link>
                    ))}
                </div>
                {page < Math.ceil(totalCount / pageSize) && (
                    <Link href={`/admin/products?page=${page + 1}&q=${query}`} className="admin-pagination-btn">
                        Suivant &gt;
                    </Link>
                )}
            </div>
        </>
    );
}

