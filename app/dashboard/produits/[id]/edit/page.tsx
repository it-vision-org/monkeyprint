import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getR2Url } from "@/lib/storage";
import EditProductForm from "./EditProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stores: true }
    });

    if (!user || user.stores.length === 0) redirect("/create-shop");
    const store = user.stores[0];

    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product || product.storeId !== store.id) {
        notFound();
    }

    const imageUrl = product.previewFront ? await getR2Url(product.previewFront) : null;

    return (
        <div className="produits-main">
            <div className="produits-container">
                <div className="produits-title-row">
                    <h1 className="produits-page-title">Modifier le produit</h1>
                </div>

                <EditProductForm product={product} imageUrl={imageUrl} />
            </div>
        </div>
    );
}

