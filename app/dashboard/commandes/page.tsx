
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import OrderActions from "./OrderActions";

export default async function CommandesPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stores: true }
    });

    if (!user || user.stores.length === 0) redirect("/create-shop");
    const store = user.stores[0];

    const statusParam = searchParams.status || 'non-confirme';
    const query = searchParams.q || '';

    let whereStatus: any = {};

    if (statusParam === 'non-confirme') {
        whereStatus = { status: 'PENDING' };
    } else if (statusParam === 'confirme') {
        whereStatus = { status: { in: ['PAID', 'SHIPPED', 'COMPLETED'] } };
    } else if (statusParam === 'retours') {
        whereStatus = { status: 'RETURNED' };
    }

    // Build search filter
    let searchFilter: any = {};
    if (query) {
        searchFilter.OR = [
            { id: { contains: query, mode: 'insensitive' } },
            { customer: { name: { contains: query, mode: 'insensitive' } } },
            { customer: { phoneNumber: { contains: query, mode: 'insensitive' } } },
            { customer: { address: { contains: query, mode: 'insensitive' } } },
        ];
    }

    const orders = await prisma.order.findMany({
        where: {
            storeId: store.id,
            ...whereStatus,
            ...searchFilter
        },
        include: {
            customer: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const getStatusConfig = () => {
        switch (statusParam) {
            case 'confirme':
                return {
                    title: 'Liste de commandes confirmé',
                    icon: 'check'
                };
            case 'retours':
                return {
                    title: 'Liste de commandes retourné',
                    icon: 'none',
                    showAlert: true
                };
            case 'non-confirme':
            default:
                return {
                    title: 'Liste de commandes non confirmé',
                    icon: 'check'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className="commandes-page">
            <div className="commandes-main">
                <div className="commandes-container">
                    <div className="commandes-status-tabs">
                        <Link
                            href={`/dashboard/commandes?status=non-confirme${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                            className={`commandes-status-tab orange ${statusParam === 'non-confirme' ? 'active' : ''}`}
                        >
                            <span className="dash-submenu-dot orange"></span>
                            Non confirmé
                        </Link>
                        <Link
                            href={`/dashboard/commandes?status=confirme${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                            className={`commandes-status-tab green ${statusParam === 'confirme' ? 'active' : ''}`}
                        >
                            <span className="dash-submenu-dot green"></span>
                            Confirmé
                        </Link>
                        <Link
                            href={`/dashboard/commandes?status=retours${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                            className={`commandes-status-tab red ${statusParam === 'retours' ? 'active' : ''}`}
                        >
                            <span className="dash-submenu-dot red"></span>
                            Retours
                        </Link>
                    </div>

                    <div className="commandes-header">
                        <h1 className="commandes-title">
                            {config.title}
                            {statusParam === 'confirme' && (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="title-check">
                                    <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </h1>
                    </div>

                    {config.showAlert && (
                        <div className="commandes-alert">
                            Les articles retournés revendus vous feront gagner le montant total du produit !
                        </div>
                    )}

                    <div className="commandes-search-bar">
                        <form action="/dashboard/commandes" method="get" className="commandes-search" style={{ width: '100%', display: 'flex' }}>
                            <input type="hidden" name="status" value={statusParam} />
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '12px', position: 'absolute', pointerEvents: 'none' }}>
                                <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <input 
                                type="text" 
                                name="q"
                                placeholder="Rechercher par ID, nom, téléphone ou adresse..." 
                                defaultValue={query}
                                style={{ width: '100%', paddingLeft: '40px' }}
                            />
                        </form>
                        {/* Removed Date Picker mock for now, keep simplistic */}
                    </div>

                    <div className="commandes-list">
                        {orders.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                Aucune commande trouvée.
                            </div>
                        ) : (
                            orders.map((order) => (
                                <Link 
                                    key={order.id} 
                                    href={`/dashboard/commandes/${order.id}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div className="commande-card" style={{ cursor: 'pointer' }}>
                                        <div className="commande-card-header">
                                            <div className="commande-id">#{order.id.slice(0, 8)}</div>
                                            <div className="commande-header-right">
                                                <div className="commande-date">{format(order.createdAt, "dd/MM/yyyy")}</div>
                                                <div onClick={(e) => e.preventDefault()}>
                                                    <OrderActions orderId={order.id} status={order.status} />
                                                </div>
                                            </div>
                                        </div>
                                    <div className="commande-card-body">
                                        <div className="commande-row">
                                            <div className="commande-label">Nom</div>
                                            <div className="commande-value">{order.customer.name || '-'}</div>
                                        </div>
                                        <div className="commande-row">
                                            <div className="commande-label">Adress</div>
                                            <div className="commande-value">{order.customer.address || '-'}</div>
                                        </div>
                                        <div className="commande-row">
                                            <div className="commande-label">Numero</div>
                                            <div className="commande-value">{order.customer.phoneNumber}</div>
                                        </div>
                                        <div className="commande-row">
                                            <div className="commande-label">Total</div>
                                            <div className="commande-total">{order.totalAmount} DT</div>
                                        </div>
                                    </div>
                                </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
