
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getR2Url } from "@/lib/storage";
import Link from "next/link";
import ProductCard from "./ProductCard";

import styles from "../../styles/produits.module.css";

export default async function ProduitsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/"); // Changed from email to id for consistency

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
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
        <div className={styles.produitsMain}>
            <div className={styles.produitsContainer}>
                <div className={styles.produitsTitleRow}>
                    <h1 className={styles.produitsPageTitle}>Liste de produits</h1>
                    <Link href="/dashboard/product-upload" className={styles.produitsAddBtn}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>

                <div className={styles.produitsGrid}>
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
