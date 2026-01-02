
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getR2Url } from "@/lib/storage";
import Link from "next/link";
import ProductCard from "./ProductCard";

export default async function ProduitsPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true }
    });

    if (!user || !user.store) redirect("/create-shop");
    const store = user.store;

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
                    <Link href="/dashboard/product-upload" className="produits-add-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>

                <div className="produits-grid">
                    {products.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#666' }}>
                            Aucun produit. <Link href="/dashboard/product-upload" style={{ color: '#000', textDecoration: 'underline' }}>Créez-en un !</Link>
                        </div>
                    ) : (
                        await Promise.all(products.map(async (product: typeof products[number]) => {
                            const imageUrl = product.previewFront ? await getR2Url(product.previewFront) : null;

                            return (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    imageUrl={imageUrl}
                                />
                            );
                        }))
                    )}
                </div>
            </div>
        </div>
    );
}
