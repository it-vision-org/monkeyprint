import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ApercuPage() {
    const session = await auth();
    if (!session?.user?.id) return redirect("/create-shop");

    const store = await prisma.store.findFirst({
        where: { ownerId: session.user.id },
        include: {
            orders: true
        }
    });

    if (!store) {
        return redirect("/create-shop");
    }

    // Calculate stats
    const totalSales = store.orders
        .filter((o: any) => o.status !== 'PENDING') // Assuming PENDING means not paid yet
        .reduce((sum: number, order: any) => sum + order.totalAmount, 0);

    const pendingOrdersCount = store.orders.filter((o: any) => o.status === 'PENDING').length;
    // Or if PENDING means "Paid but not shipped", adjust status logic.
    // For now, let's assume PENDING = New Order (Paid? or just created?). 
    // Usually PENDING = Created but not paid. 
    // Let's assume PAID is the valid status for sales.
    // But for "Commandes en attente" (Pending Orders), it usually means "To be shipped".
    // I will stick to a simple mapping: PENDING = To be processed (maybe waiting payment or shipping). 
    // Let's assume for this POC: PENDING = Paid & Waiting Shipping.

    // Actually, in many systems: Created -> Paid -> Shipped.
    // Let's count "PENDING" as active orders awaiting action.

    // Mocking change percentages for now as we don't have historical data structure easily accessible without complex queries

    return (
        <>
            <h1 className="dash-page-title">Aperçu</h1>
            <div className="apercu-grid">
                {/* Row 1: Ventes totales & Commandes en attente */}
                <div className="apercu-card apercu-ventes">
                    <h3 className="apercu-card-label">Ventes totales</h3>
                    <div className="apercu-card-value">
                        <span className="apercu-value">{totalSales.toFixed(0)}</span>
                        <span className="apercu-currency">DT</span>
                    </div>
                    <div className="apercu-change positive">
                        +0%
                    </div>
                    <div className="apercu-card-subtitle">Depuis le mois dernier</div>
                </div>

                <div className="apercu-card apercu-commandes">
                    <h3 className="apercu-card-label">Commandes en attente</h3>
                    <div className="apercu-card-value-simple">
                        {pendingOrdersCount}
                    </div>
                    <div className="apercu-change negative">
                        -0%
                    </div>
                    <div className="apercu-card-subtitle">Depuis le mois dernier</div>
                </div>

                {/* Row 2: Paiement en attente */}
                <div className="apercu-card apercu-paiement-attente">
                    <h3 className="apercu-card-label">Paiement en attente</h3>
                    <div className="apercu-card-value">
                        <span className="apercu-value">0</span>
                        <span className="apercu-currency">DT</span>
                    </div>
                    <div className="apercu-change positive">
                        +0%
                    </div>
                    <div className="apercu-card-subtitle">Depuis le mois dernier</div>
                </div>

                {/* Row 3: Paiement en cours */}
                <div className="apercu-card apercu-paiement-cours">
                    <div className="apercu-header-row">
                        <h3 className="apercu-card-label">Paiement en cours</h3>
                        <div className="apercu-date">{new Date().toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div className="apercu-subtitle-special">Le montant d&apos;argent que vous pouvez retirer !</div>
                    <div className="apercu-card-value">
                        <span className="apercu-value">0</span>
                        <span className="apercu-currency">DT</span>
                    </div>
                    <div className="apercu-card-notice">Une fois prêt, un courriel vous sera envoyé.</div>
                </div>

                {/* Row 4: Commandes retournées */}
                <div className="apercu-card apercu-retournees">
                    <h3 className="apercu-card-label">Commandes retournées</h3>
                    <div className="apercu-card-value-negative">
                        <span className="apercu-value">-0</span>
                        <span className="apercu-currency">DT</span>
                    </div>
                </div>

                {/* Sales Trend Chart */}
                <div className="apercu-chart-section">
                    <h3 className="apercu-chart-title">Tendance des ventes</h3>

                    <div className="apercu-chart-tabs">
                        <button className="apercu-tab active">Aujourd&apos;hui</button>
                        <button className="apercu-tab">7 Jours</button>
                        <button className="apercu-tab">30 Jours</button>
                        <button className="apercu-tab">Personnalisé</button>
                    </div>

                    <div className="apercu-chart-card">
                        <div className="apercu-chart-header">
                            <div className="apercu-chart-label">Ventes</div>
                            <div className="apercu-chart-value-row">
                                <span className="apercu-chart-value">{totalSales}</span>
                                <span className="apercu-chart-currency"> DT</span>
                            </div>
                        </div>
                        <div className="apercu-chart-subtext">
                            Dernier 30 Jours <span className="apercu-chart-change">+0%</span>
                        </div>

                        {/* Chart Visualization - Static for now */}
                        <div className="apercu-chart">
                            <svg viewBox="0 0 600 250" className="apercu-chart-svg" preserveAspectRatio="xMidYMid meet">
                                <line x1="50" y1="20" x2="50" y2="220" stroke="#e5e7eb" strokeWidth="1" />
                                <line x1="50" y1="220" x2="550" y2="220" stroke="#e5e7eb" strokeWidth="1" />
                                <line x1="50" y1="180" x2="550" y2="180" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5" />
                                <line x1="50" y1="140" x2="550" y2="140" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5" />
                                <line x1="50" y1="100" x2="550" y2="100" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5" />
                                <line x1="50" y1="60" x2="550" y2="60" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5" />
                                <line x1="50" y1="20" x2="550" y2="20" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5" />

                                <text x="40" y="225" fontSize="12" fill="#9ca3af" textAnchor="end" alignmentBaseline="middle">0</text>
                                <text x="40" y="105" fontSize="12" fill="#9ca3af" textAnchor="end" alignmentBaseline="middle">500</text>
                                <text x="40" y="65" fontSize="12" fill="#9ca3af" textAnchor="end" alignmentBaseline="middle">1000</text>

                                <polyline
                                    points="80,220 500,220"
                                    fill="none"
                                    stroke="#0ea5e9"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                <text x="80" y="240" fontSize="12" fill="#0ea5e9" textAnchor="middle" fontWeight="600">Jan</text>
                                <text x="140" y="240" fontSize="12" fill="#0ea5e9" textAnchor="middle" fontWeight="600">Feb</text>
                                <text x="200" y="240" fontSize="12" fill="#0ea5e9" textAnchor="middle" fontWeight="600">Mar</text>
                                <text x="260" y="240" fontSize="12" fill="#0ea5e9" textAnchor="middle" fontWeight="600">Apr</text>
                                <text x="320" y="240" fontSize="12" fill="#0ea5e9" textAnchor="middle" fontWeight="600">May</text>
                                <text x="380" y="240" fontSize="12" fill="#0ea5e9" textAnchor="middle" fontWeight="600">Jun</text>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}


