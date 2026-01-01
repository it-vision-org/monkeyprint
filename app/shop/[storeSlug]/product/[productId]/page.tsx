import { prisma } from "@/lib/prisma";
import { getR2Url } from "@/lib/storage";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductPage({ params }: { params: Promise<{ storeSlug: string, productId: string }> }) {
    const { storeSlug, productId } = await params;
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { store: true }
    });

    if (!product || !product.store) notFound();

    const frontUrl = product.previewFront ? await getR2Url(product.previewFront) : null;
    const backUrl = product.previewBack ? await getR2Url(product.previewBack) : null;

    return (
        <div style={{ minHeight: '100vh', background: '#fff' }}>
            <header style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                <a href={`/shop/${storeSlug}`} style={{ textDecoration: 'none', color: '#333', fontWeight: 600 }}>
                    ← Retour à la boutique
                </a>
            </header>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                {/* Images */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ aspectRatio: '1', background: '#f9fafb', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee' }}>
                        {frontUrl && (
                            <Image 
                                src={frontUrl} 
                                alt="Front" 
                                width={500} 
                                height={500}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                            />
                        )}
                    </div>
                    {backUrl && (
                        <div style={{ aspectRatio: '1', background: '#f9fafb', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee' }}>
                            <Image 
                                src={backUrl} 
                                alt="Back" 
                                width={500} 
                                height={500}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                            />
                        </div>
                    )}
                </div>

                {/* Details */}
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>{product.name}</h1>
                    <p style={{ fontSize: '24px', color: '#41eb5c', fontWeight: 'bold', marginBottom: '24px' }}>{product.basePrice} DT</p>

                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Description</h3>
                        <p style={{ color: '#666', lineHeight: '1.6' }}>{product.description || "Aucune description."}</p>
                    </div>

                    <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #eee' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Commander maintenant</h3>
                        <AddToCartButton product={product} frontUrl={frontUrl} storeName={product.store.name} storeSlug={storeSlug} />
                    </div>
                </div>
            </div>
        </div>
    );
}

