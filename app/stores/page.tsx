import { prisma } from "@/lib/prisma";
import { getR2Url } from "@/lib/storage";
import Link from "next/link";
import Image from "next/image";

export default async function StoresPage() {
    const stores = await prisma.store.findMany({
        where: {
            status: 'ACTIVE' // Only show active stores
        },
        include: {
            owner: true,
            _count: {
                select: { products: true, orders: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Get logo URLs for all stores
    const storesWithLogos = await Promise.all(
        stores.map(async (store) => {
            const logoUrl = store.logoUrl ? await getR2Url(store.logoUrl) : null;
            return { ...store, logoUrl };
        })
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
            {/* Header */}
            <header style={{
                background: 'white',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                marginBottom: '40px'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                        <Image
                            src="/logo.png"
                            alt="Monkey Print"
                            width={100}
                            height={50}
                            style={{ objectFit: 'contain' }}
                        />
                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#000' }}>MONKEY PRINT</span>
                    </Link>
                    <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <Link href="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '16px' }}>Accueil</Link>
                        <Link href="/stores" style={{ color: '#000', textDecoration: 'none', fontSize: '16px', fontWeight: 600 }}>Boutiques</Link>
                        <Link href="/contact" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '16px' }}>Contact</Link>
                    </nav>
                </div>
            </header>

            {/* Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
                        Découvrez les boutiques
                    </h1>
                    <p style={{ fontSize: '20px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
                        Explorez toutes nos boutiques et découvrez des produits uniques créés par nos vendeurs
                    </p>
                </div>

                {storesWithLogos.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '24px' }}>
                            Aucune boutique disponible pour le moment.
                        </p>
                        <Link 
                            href="/create-shop" 
                            style={{
                                display: 'inline-block',
                                background: '#000',
                                color: 'white',
                                padding: '16px 32px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '16px'
                            }}
                        >
                            Créer une boutique
                        </Link>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '32px'
                    }}>
                        {storesWithLogos.map((store) => (
                            <Link
                                key={store.id}
                                href={`/shop/${store.slug}`}
                                style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    display: 'block',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                className="store-card-hover"
                            >
                                {/* Store Logo/Image */}
                                <div style={{
                                    width: '100%',
                                    height: '250px',
                                    background: '#f3f4f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    {store.logoUrl ? (
                                        <Image
                                            src={store.logoUrl}
                                            alt={store.name}
                                            width={200}
                                            height={200}
                                            style={{ objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '48px',
                                            fontWeight: 'bold'
                                        }}>
                                            {store.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Store Info */}
                                <div style={{ padding: '24px' }}>
                                    <h3 style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        marginBottom: '8px',
                                        color: '#1f2937'
                                    }}>
                                        {store.name}
                                    </h3>
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        marginBottom: '16px'
                                    }}>
                                        Par {store.owner.name || store.owner.email}
                                    </p>

                                    {/* Stats */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '24px',
                                        paddingTop: '16px',
                                        borderTop: '1px solid #e5e7eb'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>
                                                {store._count.products}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Produits</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>
                                                {store._count.orders}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Commandes</div>
                                        </div>
                                    </div>

                                    {/* Visit Button */}
                                    <div style={{ marginTop: '20px' }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            color: '#1e66d1',
                                            fontSize: '14px',
                                            fontWeight: 600
                                        }}>
                                            Visiter la boutique
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

