import { prisma } from "@/lib/prisma";
import { getR2Url } from "@/lib/storage";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function StorePage({ params }: { params: { storeSlug: string } }) {
    const store = await prisma.store.findUnique({
        where: { slug: params.storeSlug },
        include: {
            products: true
        }
    });

    if (!store) {
        notFound();
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
            {/* Store Header */}
            <header style={{
                background: 'white',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                justifyContent: 'center'
            }}>
                {store.logoUrl ? (
                    <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', border: '1px solid #eee' }}>
                        {/* Assuming logoUrl is R2 key or full URL. If key, we need to resolve it. 
                            Our storage lib helper creates full URL? No, `uploadImageToR2` returns the key.
                            We need to resolve it. Since this is a server component, we can resolve it.
                            But `getR2Url` is async if we needed presigned, but here it's just string concat.
                         */}
                        <img
                            src={await getR2Url(store.logoUrl)}
                            alt={store.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                ) : (
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        🏠
                    </div>
                )}
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{store.name}</h1>
            </header>

            {/* Product Grid */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#333' }}>Nos Produits</h2>

                {store.products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                        Aucun produit disponible pour le moment.
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '30px'
                    }}>
                        {await Promise.all(store.products.map(async (product) => {
                            const imageUrl = product.previewFront ? await getR2Url(product.previewFront) : null;

                            return (
                                <Link
                                    href={`/${store.slug}/product/${product.id}`}
                                    key={product.id}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                        transition: 'transform 0.2s',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <div style={{ aspectRatio: '1', background: '#f5f5f5', position: 'relative' }}>
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={product.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ padding: '16px', flex: 1 }}>
                                            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>{product.name}</h3>
                                            <p style={{ margin: 0, fontWeight: 700, color: '#41eb5c' }}>{product.basePrice} DT</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        }))}
                    </div>
                )}
            </main>
        </div>
    );
}
