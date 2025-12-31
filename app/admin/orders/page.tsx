'use client';

import { useState } from "react";

export default function AdminOrdersPage() {
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const orders = [
        { id: "#ORD-1234", store: "FashionStore", customer: "Omar Belhaj", amount: "150 DT", status: "pending", date: "2024-06-11", items: 3 },
        { id: "#ORD-1233", store: "StyleZone", customer: "Nour Ben Youssef", amount: "89 DT", status: "confirmed", date: "2024-06-11", items: 2 },
        { id: "#ORD-1232", store: "TrendShop", customer: "Youssef Khelifi", amount: "234 DT", status: "shipped", date: "2024-06-10", items: 5 },
        { id: "#ORD-1231", store: "DesignCo", customer: "Ahmed Ben Ali", amount: "67 DT", status: "delivered", date: "2024-06-09", items: 1 },
        { id: "#ORD-1230", store: "EcoFashion", customer: "Sara Trabelsi", amount: "320 DT", status: "confirmed", date: "2024-06-09", items: 4 },
        { id: "#ORD-1229", store: "VintageVibes", customer: "Lina Mansouri", amount: "145 DT", status: "delivered", date: "2024-06-08", items: 2 },
        { id: "#ORD-1228", store: "FashionStore", customer: "Mohamed Ammar", amount: "98 DT", status: "cancelled", date: "2024-06-08", items: 2 },
        { id: "#ORD-1227", store: "TrendShop", customer: "Fatma Haddad", amount: "278 DT", status: "shipped", date: "2024-06-07", items: 6 },
    ];

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            order.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.customer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'pending': return 'orange';
            case 'confirmed': return 'blue';
            case 'shipped': return 'purple';
            case 'delivered': return 'green';
            case 'cancelled': return 'red';
            default: return 'gray';
        }
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'pending': return 'En attente';
            case 'confirmed': return 'Confirmé';
            case 'shipped': return 'Expédié';
            case 'delivered': return 'Livré';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    };

    return (
        <>
            <div className="admin-orders-header">
                <h1 className="dash-page-title">Gestion des Commandes</h1>
                <div className="admin-orders-actions">
                    <button className="admin-export-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Exporter
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-orders-stats">
                <div className="admin-orders-stat-card">
                    <div className="admin-orders-stat-value">{orders.length}</div>
                    <div className="admin-orders-stat-label">Total Commandes</div>
                </div>
                <div className="admin-orders-stat-card">
                    <div className="admin-orders-stat-value">{orders.filter(o => o.status === 'pending').length}</div>
                    <div className="admin-orders-stat-label">En attente</div>
                </div>
                <div className="admin-orders-stat-card">
                    <div className="admin-orders-stat-value">{orders.filter(o => o.status === 'confirmed').length}</div>
                    <div className="admin-orders-stat-label">Confirmées</div>
                </div>
                <div className="admin-orders-stat-card">
                    <div className="admin-orders-stat-value">{orders.reduce((sum, o) => sum + parseFloat(o.amount.replace(' DT', '').replace(',', '')), 0).toLocaleString()} DT</div>
                    <div className="admin-orders-stat-label">Revenus Totaux</div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-orders-filters">
                <div className="admin-search-bar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Rechercher par ID, magasin ou client..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="admin-filter-tabs">
                    <button 
                        className={`admin-filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        Toutes ({orders.length})
                    </button>
                    <button 
                        className={`admin-filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('pending')}
                    >
                        En attente ({orders.filter(o => o.status === 'pending').length})
                    </button>
                    <button 
                        className={`admin-filter-tab ${filterStatus === 'confirmed' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('confirmed')}
                    >
                        Confirmées ({orders.filter(o => o.status === 'confirmed').length})
                    </button>
                    <button 
                        className={`admin-filter-tab ${filterStatus === 'shipped' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('shipped')}
                    >
                        Expédiées ({orders.filter(o => o.status === 'shipped').length})
                    </button>
                    <button 
                        className={`admin-filter-tab ${filterStatus === 'delivered' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('delivered')}
                    >
                        Livrées ({orders.filter(o => o.status === 'delivered').length})
                    </button>
                    <button 
                        className={`admin-filter-tab ${filterStatus === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('cancelled')}
                    >
                        Annulées ({orders.filter(o => o.status === 'cancelled').length})
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="admin-orders-table-wrapper">
                <table className="admin-orders-table">
                    <thead>
                        <tr>
                            <th>ID Commande</th>
                            <th>Magasin</th>
                            <th>Client</th>
                            <th>Articles</th>
                            <th>Montant</th>
                            <th>Statut</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.id}>
                                <td className="admin-order-id">{order.id}</td>
                                <td>{order.store}</td>
                                <td>{order.customer}</td>
                                <td>{order.items}</td>
                                <td className="admin-order-amount">{order.amount}</td>
                                <td>
                                    <span className={`admin-status-badge ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </td>
                                <td>{order.date}</td>
                                <td>
                                    <div className="admin-action-buttons">
                                        <button className="admin-action-btn view" title="Voir détails">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                        {order.status === 'pending' && (
                                            <button className="admin-action-btn approve" title="Confirmer">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="admin-pagination">
                <button className="admin-pagination-btn">
                    &lt; Précédent
                </button>
                <div className="admin-pagination-numbers">
                    <button className="admin-pagination-number active">1</button>
                    <button className="admin-pagination-number">2</button>
                </div>
                <button className="admin-pagination-btn">
                    Suivant &gt;
                </button>
            </div>
        </>
    );
}

