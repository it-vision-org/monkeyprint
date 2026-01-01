import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getR2Url } from "@/lib/storage";
import { format } from "date-fns";

export default async function OrderConfirmationPage({
    searchParams,
}: {
    searchParams: Promise<{ orders?: string }>;
}) {
    const resolvedParams = await searchParams;
    const orderIds = resolvedParams.orders ? resolvedParams.orders.split(',') : [];
    let orders: any[] = [];

    if (orderIds.length > 0) {
        orders = await prisma.order.findMany({
            where: { id: { in: orderIds } },
            include: {
                store: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Pre-load all images
        for (const order of orders) {
            for (const item of order.items) {
                if (item.product.previewFront) {
                    (item as any).imageUrl = await getR2Url(item.product.previewFront);
                }
            }
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'En attente';
            case 'PAID': return 'Payé';
            case 'SHIPPED': return 'Expédié';
            case 'COMPLETED': return 'Terminé';
            case 'RETURNED': return 'Retourné';
            default: return status;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '80px', height: '80px', background: '#41eb5c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h1 style={{ margin: '0 0 12px', fontSize: '24px' }}>Merci pour votre commande !</h1>
                    <p style={{ color: '#666', marginBottom: '32px' }}>Votre commande a été reçue et est en cours de traitement.<br />Nous vous contacterons bientôt pour confirmer la livraison.</p>
                </div>

                {orders.length > 0 && (
                    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Détails de la commande</h2>
                        {orders.map((order, orderIdx) => (
                            <div key={order.id} style={{ marginBottom: orderIdx < orders.length - 1 ? '32px' : '0', paddingBottom: orderIdx < orders.length - 1 ? '32px' : '0', borderBottom: orderIdx < orders.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{order.store.name}</h3>
                                        <p style={{ color: '#666', fontSize: '14px' }}>
                                            Commande #{order.id.slice(0, 8)} • {format(new Date(order.createdAt), "d MMMM yyyy 'à' HH:mm")}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '18px', fontWeight: 600, color: '#41eb5c' }}>{order.totalAmount.toFixed(2)} DT</p>
                                        <p style={{ fontSize: '14px', color: '#666' }}>
                                            {getStatusLabel(order.status)}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    {order.items.map((item: any, idx: number) => (
                                        <div key={idx} style={{ display: 'flex', gap: '16px', marginBottom: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                                            {item.imageUrl && (
                                                <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                                    <img 
                                                        src={item.imageUrl} 
                                                        alt={item.product.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    />
                                                </div>
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 600, marginBottom: '4px' }}>{item.product.name}</p>
                                                <p style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                                                    Quantité: {item.quantity} × {item.price.toFixed(2)} DT
                                                </p>
                                                <p style={{ fontWeight: 600, color: '#41eb5c' }}>{(item.price * item.quantity).toFixed(2)} DT</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <Link href="/" style={{ display: 'inline-block', background: '#000', color: 'white', fontWeight: 'bold', padding: '16px 32px', borderRadius: '12px', textDecoration: 'none' }}>
                        Trouver d&apos;autres produits
                    </Link>
                </div>
            </div>
        </div>
    );
}
