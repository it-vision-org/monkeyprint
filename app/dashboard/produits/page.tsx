
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getR2Url } from "@/lib/storage";
import Link from "next/link";
import ProductCard from "./ProductCard";

import styles from "../../styles/produits.module.css";

type ProduitsSearchParams = {
    status?: string;
    productId?: string;
    storeSlug?: string;
};

export default async function ProduitsPage({
    searchParams,
}: {
    searchParams?: Promise<ProduitsSearchParams>;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/"); // Changed from email to id for consistency

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { store: true }
    });

    if (!user || !user.store) redirect("/create-shop");
    const store = user.store;

    const resolvedSearch = searchParams ? await searchParams : {};

    const products = await prisma.product.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { orderItems: true }
            }
        }
    });

    const savedStatus = resolvedSearch.status;
    const savedProductId = resolvedSearch.productId;
    const storeSlug = resolvedSearch.storeSlug || store.slug;
    const productDetailHref = savedProductId ? `/shop/${storeSlug}/product/${savedProductId}` : null;

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

                {(savedStatus === "created" || savedStatus === "updated") && (
                    <div
                        style={{
                            display: "grid",
                            gap: "10px",
                            background: "linear-gradient(135deg, #ecfdf3 0%, #f0fdf4 100%)",
                            border: "1px solid #86efac",
                            borderRadius: "14px",
                            padding: "16px",
                            marginBottom: "18px",
                        }}
                    >
                        <strong style={{ color: "#166534" }}>
                            {savedStatus === "created"
                                ? "Produit publié avec succès."
                                : "Produit mis à jour avec succès."}
                        </strong>
                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                            {productDetailHref && (
                                <Link
                                    href={productDetailHref}
                                    target="_blank"
                                    style={{ color: "#166534", textDecoration: "underline", fontWeight: 600 }}
                                >
                                    Ouvrir la fiche produit
                                </Link>
                            )}
                            <Link
                                href={`/shop/${storeSlug}/all-products`}
                                target="_blank"
                                style={{ color: "#166534", textDecoration: "underline", fontWeight: 600 }}
                            >
                                Vérifier dans la boutique
                            </Link>
                        </div>
                    </div>
                )}

                <div className={styles.produitsGrid}>
                    {products.length === 0 ? (
                        <div
                            style={{
                                gridColumn: "1/-1",
                                textAlign: "center",
                                padding: "40px",
                                color: "#666",
                                display: "grid",
                                gap: "10px",
                            }}
                        >
                            <p style={{ margin: 0 }}>
                                Aucun produit publié pour le moment.
                            </p>
                            <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
                                <Link href="/dashboard/product-upload" style={{ color: "#000", textDecoration: "underline" }}>
                                    Créer votre premier produit
                                </Link>
                                <Link href={`/shop/${store.slug}/all-products`} target="_blank" style={{ color: "#000", textDecoration: "underline" }}>
                                    Voir la boutique publique
                                </Link>
                            </div>
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
