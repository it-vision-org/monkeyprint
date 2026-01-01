
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";

export default async function PortefeuillePage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stores: true }
    });

    if (!user || user.stores.length === 0) redirect("/create-shop");
    const store = user.stores[0];

    // Fetch all orders
    const orders = await prisma.order.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: 'desc' },
        include: { items: true } // Need items for calculation? Order has totalAmount.
    });

    // Calculate "En attente" (Pending/Shipped but not Completed/Paid)
    // Assumption: 'PENDING' and 'SHIPPED' count as pending funds?
    // Let's assume 'PENDING' is pending.
    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    const pendingAmount = pendingOrders.reduce((acc, o) => acc + o.totalAmount, 0);

    // Calculate "Pret" (Paid/Completed)
    // Assumption: 'PAID' or 'COMPLETED' means ready to withdraw.
    const availableOrders = orders.filter(o => ['PAID', 'COMPLETED'].includes(o.status));
    const availableAmount = availableOrders.reduce((acc, o) => acc + o.totalAmount, 0);

    // Get last withdrawal
    const lastWithdrawal = await prisma.withdrawal.findFirst({
        where: {
            storeId: store.id,
            status: { in: ['APPROVED', 'COMPLETED'] }
        },
        orderBy: { processedAt: 'desc' }
    });

    const withdrawnAmount = lastWithdrawal?.amount || 0;

    return (
        <div className="portefeuille-main">
            <div className="portefeuille-container">
                <div className="portefeuille-page-header">
                    <h1 className="portefeuille-page-title">Portefeuille</h1>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 8H3M21 8V16C21 16.5304 20.7893 17.0391 20.4142 17.4142C20.0391 17.7893 19.5304 18 19 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V8M21 8L19 3H5L3 8" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="13" r="2" stroke="#1f2937" strokeWidth="2" />
                    </svg>
                </div>

                {/* Paiement en attente */}
                <div className="portefeuille-section">
                    <div className="portefeuille-section-icon orange-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                            <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="portefeuille-section-content">
                        <h3 className="portefeuille-section-title">Paiement en attente</h3>
                        <p className="portefeuille-section-desc">Le montant des ventes en attente d&apos;être déposé dans votre portefeuille !</p>
                        <div className="portefeuille-section-amount orange-amount">
                            <span className="portefeuille-section-value">{pendingAmount}</span>
                            <span className="portefeuille-section-currency">DT</span>
                        </div>
                        <div className="portefeuille-section-items">
                            <div className="portefeuille-section-item-label">Articles Vendus :</div>
                            {pendingOrders.slice(0, 3).map(order => (
                                <div key={order.id} className="portefeuille-section-item">
                                    <span>ID #{order.id.slice(0, 8)}</span>
                                    <span className="portefeuille-section-item-price orange-price">{order.totalAmount} DT</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="portefeuille-divider"></div>

                {/* Paiement prêt */}
                <div className="portefeuille-section">
                    <div className="portefeuille-section-icon green-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2V22M17 7H9.5C8.57174 7 7.6815 7.36875 7.02513 8.02513C6.36875 8.6815 6 9.57174 6 10.5C6 11.4283 6.36875 12.3185 7.02513 12.9749C7.6815 13.6313 8.57174 14 9.5 14H14.5C15.4283 14 16.3185 14.3687 16.9749 15.0251C17.6313 15.6815 18 16.5717 18 17.5C18 18.4283 17.6313 19.3185 16.9749 19.9749C16.3185 20.6313 15.4283 21 14.5 21H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="portefeuille-section-content">
                        <h3 className="portefeuille-section-title">Paiement prêt</h3>
                        <p className="portefeuille-section-desc">Le montant d&apos;argent que vous pouvez retirer !</p>
                        <div className="portefeuille-section-date">{format(new Date(), "dd/MM/yyyy")}</div>
                        <div className="portefeuille-section-amount green-amount">
                            <span className="portefeuille-section-value">{availableAmount}</span>
                            <span className="portefeuille-section-currency">DT</span>
                        </div>
                        <div className="portefeuille-section-items">
                            <div className="portefeuille-section-item-label">Articles Vendus et traité :</div>
                            {availableOrders.slice(0, 3).map(order => (
                                <div key={order.id} className="portefeuille-section-item">
                                    <span>ID #{order.id.slice(0, 8)}</span>
                                    <span className="portefeuille-section-item-price green-price">{order.totalAmount} DT</span>
                                </div>
                            ))}
                            <Link href="/dashboard/portefeuille/withdraw" className="portefeuille-section-button" style={{ textDecoration: 'none', display: 'block' }}>
                                Recevez votre paiement
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="portefeuille-divider"></div>

                {/* Votre dernier paiement */}
                <div className="portefeuille-section">
                    <div className="portefeuille-section-icon purple-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                            <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="portefeuille-section-content">
                        <h3 className="portefeuille-section-title">Votre dernier paiement</h3>
                        <p className="portefeuille-section-desc">Votre dernier retrait d&apos;argent !</p>
                        {lastWithdrawal && (
                            <div className="portefeuille-section-date">
                                {format(lastWithdrawal.processedAt || lastWithdrawal.requestedAt, "dd/MM/yyyy")}
                            </div>
                        )}
                        <div className="portefeuille-section-amount purple-amount">
                            <span className="portefeuille-section-value">{withdrawnAmount}</span>
                            <span className="portefeuille-section-currency">DT</span>
                        </div>
                        {lastWithdrawal && (
                            <div className="portefeuille-section-items">
                                <Link 
                                    href="/dashboard/portefeuille/withdrawals"
                                    style={{ 
                                        display: 'block',
                                        marginTop: '12px',
                                        fontSize: '14px',
                                        color: '#a855f7',
                                        fontWeight: 600,
                                        textDecoration: 'none'
                                    }}
                                >
                                    Voir l&apos;historique complet →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
