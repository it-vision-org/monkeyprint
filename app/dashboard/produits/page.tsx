
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getR2Url } from "@/lib/storage";
import Link from "next/link";

export default async function ProduitsPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stores: true }
    });

    if (!user || user.stores.length === 0) redirect("/create-shop");
    const store = user.stores[0];

    const products = await prisma.product.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { orderItems: true }
            }
        }
    });

    return (
        <div className="produits-main">
            <div className="produits-container">
                <div className="produits-title-row">
                    <h1 className="produits-page-title">Liste de produits</h1>
                    <Link href="/product-upload" className="produits-add-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>

                <div className="produits-grid">
                    {products.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#666' }}>
                            Aucun produit. <Link href="/product-upload" style={{ color: '#000', textDecoration: 'underline' }}>Créez-en un !</Link>
                        </div>
                    ) : (
                        await Promise.all(products.map(async (product) => {
                            const imageUrl = product.previewFront ? await getR2Url(product.previewFront) : null;

                            return (
                                <div key={product.id} className="produit-card">
                                    {/* Actions would go here. For now, read-only. */}

                                    <div className="produit-image-container">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: 180, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Img</div>
                                        )}
                                    </div>

                                    <div className="produit-info">
                                        <h3 className="produit-name">{product.name}</h3>
                                        <p className="produit-price">{product.basePrice} DT</p>

                                        {/* Mock Rating/reviews for now as schema doesn't have it yet */}
                                        <div className="produit-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#E5E7EB" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                                </svg>
                                            ))}
                                            <span className="produit-reviews">(0)</span>
                                        </div>

                                        <div className="produit-sold-badge">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                                                <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M16 21V11C16 10.4477 15.5523 10 15 10H9C8.44772 10 8 10.4477 8 11V21" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M2 7L12 2L22 7" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span>{product._count.orderItems} Vendu</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }))
                    )}
                </div>
            </div>
        </div>
    );
}
