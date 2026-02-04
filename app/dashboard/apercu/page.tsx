import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LoadingLink from "@/components/LoadingLink";
import Image from "next/image";
import { getR2Url } from "@/lib/storage";
import SalesChart from "./SalesChart";

export default async function ApercuPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/create-shop");
    }

    // Use findUnique if possible, or findFirst with explicit limit
    const store = await prisma.store.findFirst({
        where: {
            ownerId: session.user.id
        },
        include: {
            orders: {
                select: {
                    status: true,
                    totalAmount: true
                }
            }
        },
        // Explicitly set to get only the first result without pagination
        take: 1
    });

    if (!store) {
        redirect("/create-shop");
    }

    // Calculate stats - only count confirmed orders and later
    const totalSales = store.orders
        .filter((o: any) => o.status !== 'PENDING') // Only count confirmed and later orders
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

    // Resolve logo URL from R2
    const logoUrl = store.logoUrl ? await getR2Url(store.logoUrl) : null;

    return (
        <>

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

                <LoadingLink href="/dashboard/commandes?status=non-confirme" className="apercu-card apercu-commandes apercu-card-link">
                    <h3 className="apercu-card-label">Commandes en attente</h3>
                    <div className="apercu-card-value-simple">
                        {pendingOrdersCount}
                    </div>
                    <div className="apercu-change negative">
                        -0%
                    </div>
                    <div className="apercu-card-subtitle">Depuis le mois dernier</div>
                </LoadingLink>

                {/* Row 2: Paiement en attente */}
                <LoadingLink href="/dashboard/portefeuille" className="apercu-card apercu-paiement-attente apercu-card-link">
                    <h3 className="apercu-card-label">Paiement en attente</h3>
                    <div className="apercu-card-value">
                        <span className="apercu-value">0</span>
                        <span className="apercu-currency">DT</span>
                    </div>
                    <div className="apercu-change positive">
                        +0%
                    </div>
                    <div className="apercu-card-subtitle">Depuis le mois dernier</div>
                </LoadingLink>

                {/* Row 3: Paiement en cours */}
                <LoadingLink href="/dashboard/portefeuille" className="apercu-card apercu-paiement-cours apercu-card-link">
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
                </LoadingLink>

                {/* Row 4: Commandes retournées */}
                <LoadingLink href="/dashboard/commandes?status=retours" className="apercu-card apercu-retournees apercu-card-link">
                    <h3 className="apercu-card-label">Commandes retournées</h3>
                    <div className="apercu-card-value-negative">
                        <span className="apercu-value">-0</span>
                        <span className="apercu-currency">DT</span>
                    </div>
                </LoadingLink>

                {/* Sales Trend Chart */}
                <SalesChart />
            </div>
        </>
    );
}


