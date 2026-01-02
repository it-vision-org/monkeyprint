import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";

export default async function WithdrawalsPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stores: true }
    });

    if (!user || user.stores.length === 0) redirect("/create-shop");
    const store = user.stores[0];

    const withdrawals = await prisma.withdrawal.findMany({
        where: { storeId: store.id },
        orderBy: { requestedAt: 'desc' }
    });

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'En attente';
            case 'APPROVED':
                return 'Approuvé';
            case 'REJECTED':
                return 'Rejeté';
            case 'COMPLETED':
                return 'Terminé';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return '#f97316';
            case 'APPROVED':
            case 'COMPLETED':
                return '#10b981';
            case 'REJECTED':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    return (
        <div className="portefeuille-main">
            <div className="portefeuille-container">
                <div style={{ marginBottom: '24px' }}>
                    <Link 
                        href="/dashboard/portefeuille" 
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            color: '#2563eb',
                            textDecoration: 'none',
                            fontSize: '14px',
                            marginBottom: '24px'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Retour au portefeuille
                    </Link>
                    <h1 className="portefeuille-page-title">Historique des retraits</h1>
                </div>

                {withdrawals.length === 0 ? (
                    <div style={{ 
                        background: 'white', 
                        borderRadius: '12px', 
                        padding: '48px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '18px', color: '#6b7280', marginBottom: '24px' }}>
                            Aucun retrait pour le moment
                        </div>
                        <Link
                            href="/dashboard/portefeuille/withdraw"
                            style={{
                                display: 'inline-block',
                                padding: '12px 24px',
                                background: '#2563eb',
                                color: 'white',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontSize: '16px',
                                fontWeight: 600
                            }}
                        >
                            Demander un retrait
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {withdrawals.map((withdrawal: typeof withdrawals[number]) => (
                            <div
                                key={withdrawal.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                                            {withdrawal.amount.toFixed(2)} DT
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                            Demandé le {format(withdrawal.requestedAt, "dd/MM/yyyy à HH:mm")}
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        background: getStatusColor(withdrawal.status) + '20',
                                        color: getStatusColor(withdrawal.status),
                                        fontSize: '14px',
                                        fontWeight: 600
                                    }}>
                                        {getStatusLabel(withdrawal.status)}
                                    </div>
                                </div>

                                {withdrawal.processedAt && (
                                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                                        Traité le {format(withdrawal.processedAt, "dd/MM/yyyy à HH:mm")}
                                    </div>
                                )}

                                {withdrawal.bankDetails && (
                                    <div style={{ 
                                        marginTop: '12px',
                                        padding: '12px',
                                        background: '#f9fafb',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        color: '#374151'
                                    }}>
                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Détails bancaires:</div>
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{withdrawal.bankDetails}</div>
                                    </div>
                                )}

                                {withdrawal.notes && (
                                    <div style={{ 
                                        marginTop: '12px',
                                        padding: '12px',
                                        background: '#fef3c7',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        color: '#92400e'
                                    }}>
                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Notes:</div>
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{withdrawal.notes}</div>
                                    </div>
                                )}

                                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px' }}>
                                    ID: {withdrawal.id.slice(0, 8)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <Link
                        href="/dashboard/portefeuille/withdraw"
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            background: '#2563eb',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '16px',
                            fontWeight: 600
                        }}
                    >
                        Nouvelle demande de retrait
                    </Link>
                </div>
            </div>
        </div>
    );
}


