'use client';

import Image from "next/image";
import { useState } from "react";

export default function AdminStoresPage() {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const stores = [
        { id: 1, name: "FashionStore", owner: "Ahmed Ben Ali", email: "ahmed@fashion.com", status: "active", products: 45, orders: 234, revenue: "12,450 DT", createdAt: "2024-01-15" },
        { id: 2, name: "StyleZone", owner: "Sara Trabelsi", email: "sara@style.com", status: "pending", products: 0, orders: 0, revenue: "0 DT", createdAt: "2024-06-10" },
        { id: 3, name: "TrendShop", owner: "Mohamed Ammar", email: "mohamed@trend.com", status: "active", products: 89, orders: 567, revenue: "28,320 DT", createdAt: "2023-11-20" },
        { id: 4, name: "DesignCo", owner: "Fatma Haddad", email: "fatma@design.com", status: "active", products: 32, orders: 189, revenue: "9,450 DT", createdAt: "2024-02-05" },
        { id: 5, name: "UrbanWear", owner: "Youssef Khelifi", email: "youssef@urban.com", status: "suspended", products: 23, orders: 45, revenue: "2,250 DT", createdAt: "2024-03-12" },
        { id: 6, name: "EcoFashion", owner: "Lina Mansouri", email: "lina@eco.com", status: "active", products: 67, orders: 412, revenue: "20,600 DT", createdAt: "2023-09-08" },
        { id: 7, name: "SportStyle", owner: "Khalil Mezzi", email: "khalil@sport.com", status: "pending", products: 0, orders: 0, revenue: "0 DT", createdAt: "2024-06-11" },
        { id: 8, name: "VintageVibes", owner: "Ines Dridi", email: "ines@vintage.com", status: "active", products: 54, orders: 321, revenue: "16,050 DT", createdAt: "2024-01-28" },
    ];

    const filteredStores = stores.filter(store => {
        const matchesStatus = filterStatus === 'all' || store.status === filterStatus;
        const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            store.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            store.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'active': return 'green';
            case 'pending': return 'orange';
            case 'suspended': return 'red';
            default: return 'gray';
        }
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'active': return 'Actif';
            case 'pending': return 'En attente';
            case 'suspended': return 'Suspendu';
            default: return status;
        }
    };

    return (
        <>
            <div className="admin-stores-header">
                <h1 className="dash-page-title">Gestion des Magasins</h1>
                <div className="admin-stores-actions">
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

            {/* Filters */}
            <div className="admin-stores-filters">
                <div className="admin-search-bar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Rechercher par nom, propriétaire ou email..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="admin-filter-tabs">
                    <button 
                        className={`admin-filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        Tous ({stores.length})
                    </button>
                    <button 
                        className={`admin-filter-tab ${filterStatus === 'active' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('active')}
                    >
                        Actifs ({stores.filter(s => s.status === 'active').length})
                    </button>
                    <button 
                        className={`admin-filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('pending')}
                    >
                        En attente ({stores.filter(s => s.status === 'pending').length})
                    </button>
                    <button 
                        className={`admin-filter-tab ${filterStatus === 'suspended' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('suspended')}
                    >
                        Suspendus ({stores.filter(s => s.status === 'suspended').length})
                    </button>
                </div>
            </div>

            {/* Stores Table */}
            <div className="admin-stores-table-wrapper">
                <table className="admin-stores-table">
                    <thead>
                        <tr>
                            <th>Magasin</th>
                            <th>Propriétaire</th>
                            <th>Statut</th>
                            <th>Produits</th>
                            <th>Commandes</th>
                            <th>Revenus</th>
                            <th>Date de création</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStores.map((store) => (
                            <tr key={store.id}>
                                <td>
                                    <div className="admin-store-cell">
                                        <div className="admin-store-avatar">
                                            <span>{store.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <div className="admin-store-name">{store.name}</div>
                                            <div className="admin-store-email">{store.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{store.owner}</td>
                                <td>
                                    <span className={`admin-status-badge ${getStatusColor(store.status)}`}>
                                        {getStatusLabel(store.status)}
                                    </span>
                                </td>
                                <td>{store.products}</td>
                                <td>{store.orders}</td>
                                <td className="admin-revenue-cell">{store.revenue}</td>
                                <td>{store.createdAt}</td>
                                <td>
                                    <div className="admin-action-buttons">
                                        <button className="admin-action-btn view" title="Voir">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                        {store.status === 'pending' && (
                                            <button className="admin-action-btn approve" title="Approuver">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                        )}
                                        {store.status === 'active' && (
                                            <button className="admin-action-btn suspend" title="Suspendre">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M18 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                        )}
                                        {store.status === 'suspended' && (
                                            <button className="admin-action-btn activate" title="Activer">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                        )}
                                        <button 
                                            className="admin-action-btn delete" 
                                            title="Supprimer"
                                            onClick={() => {
                                                setSelectedStore(store.id);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
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
                    <button className="admin-pagination-number">3</button>
                </div>
                <button className="admin-pagination-btn">
                    Suivant &gt;
                </button>
            </div>

            {/* Delete Dialog */}
            {deleteDialogOpen && (
                <div className="delete-dialog-overlay" onClick={() => setDeleteDialogOpen(false)}>
                    <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
                        <p className="delete-dialog-text">Êtes-vous sûr de vouloir supprimer ce magasin ? Cette action est irréversible.</p>
                        <div className="delete-dialog-actions">
                            <button className="delete-dialog-btn confirm" onClick={() => setDeleteDialogOpen(false)}>NON</button>
                            <button className="delete-dialog-btn cancel" onClick={() => setDeleteDialogOpen(false)}>OUI</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

