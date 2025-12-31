'use client';

import { useState } from "react";

export default function AdminUsersPage() {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [filterRole, setFilterRole] = useState<'all' | 'store_owner' | 'customer'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const users = [
        { id: 1, name: "Ahmed Ben Ali", email: "ahmed@fashion.com", role: "store_owner", stores: 1, orders: 0, createdAt: "2024-01-15", status: "active" },
        { id: 2, name: "Sara Trabelsi", email: "sara@style.com", role: "store_owner", stores: 1, orders: 0, createdAt: "2024-06-10", status: "active" },
        { id: 3, name: "Mohamed Ammar", email: "mohamed@trend.com", role: "store_owner", stores: 1, orders: 0, createdAt: "2023-11-20", status: "active" },
        { id: 4, name: "Youssef Khelifi", email: "youssef@example.com", role: "customer", stores: 0, orders: 12, createdAt: "2024-03-12", status: "active" },
        { id: 5, name: "Lina Mansouri", email: "lina@eco.com", role: "store_owner", stores: 1, orders: 0, createdAt: "2023-09-08", status: "active" },
        { id: 6, name: "Khalil Mezzi", email: "khalil@sport.com", role: "store_owner", stores: 1, orders: 0, createdAt: "2024-06-11", status: "active" },
        { id: 7, name: "Ines Dridi", email: "ines@vintage.com", role: "store_owner", stores: 1, orders: 0, createdAt: "2024-01-28", status: "active" },
        { id: 8, name: "Fatma Haddad", email: "fatma@design.com", role: "store_owner", stores: 1, orders: 0, createdAt: "2024-02-05", status: "active" },
        { id: 9, name: "Omar Belhaj", email: "omar@example.com", role: "customer", stores: 0, orders: 8, createdAt: "2024-04-20", status: "active" },
        { id: 10, name: "Nour Ben Youssef", email: "nour@example.com", role: "customer", stores: 0, orders: 23, createdAt: "2023-12-15", status: "active" },
    ];

    const filteredUsers = users.filter(user => {
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRole && matchesSearch;
    });

    const getRoleLabel = (role: string) => {
        return role === 'store_owner' ? 'Propriétaire de magasin' : 'Client';
    };

    return (
        <>
            <div className="admin-users-header">
                <h1 className="dash-page-title">Gestion des Utilisateurs</h1>
                <div className="admin-users-actions">
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
            <div className="admin-users-stats">
                <div className="admin-users-stat-card">
                    <div className="admin-users-stat-value">{users.length}</div>
                    <div className="admin-users-stat-label">Total Utilisateurs</div>
                </div>
                <div className="admin-users-stat-card">
                    <div className="admin-users-stat-value">{users.filter(u => u.role === 'store_owner').length}</div>
                    <div className="admin-users-stat-label">Propriétaires</div>
                </div>
                <div className="admin-users-stat-card">
                    <div className="admin-users-stat-value">{users.filter(u => u.role === 'customer').length}</div>
                    <div className="admin-users-stat-label">Clients</div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-users-filters">
                <div className="admin-search-bar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Rechercher par nom ou email..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="admin-filter-tabs">
                    <button 
                        className={`admin-filter-tab ${filterRole === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterRole('all')}
                    >
                        Tous ({users.length})
                    </button>
                    <button 
                        className={`admin-filter-tab ${filterRole === 'store_owner' ? 'active' : ''}`}
                        onClick={() => setFilterRole('store_owner')}
                    >
                        Propriétaires ({users.filter(u => u.role === 'store_owner').length})
                    </button>
                    <button 
                        className={`admin-filter-tab ${filterRole === 'customer' ? 'active' : ''}`}
                        onClick={() => setFilterRole('customer')}
                    >
                        Clients ({users.filter(u => u.role === 'customer').length})
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="admin-users-table-wrapper">
                <table className="admin-users-table">
                    <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Magasins</th>
                            <th>Commandes</th>
                            <th>Date d'inscription</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div className="admin-user-cell">
                                        <div className="admin-user-avatar">
                                            <span>{user.name.charAt(0)}</span>
                                        </div>
                                        <div className="admin-user-name">{user.name}</div>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`admin-role-badge ${user.role === 'store_owner' ? 'owner' : 'customer'}`}>
                                        {getRoleLabel(user.role)}
                                    </span>
                                </td>
                                <td>{user.stores}</td>
                                <td>{user.orders}</td>
                                <td>{user.createdAt}</td>
                                <td>
                                    <span className="admin-status-badge green">
                                        Actif
                                    </span>
                                </td>
                                <td>
                                    <div className="admin-action-buttons">
                                        <button className="admin-action-btn view" title="Voir">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                        <button className="admin-action-btn edit" title="Modifier">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                        <button 
                                            className="admin-action-btn delete" 
                                            title="Supprimer"
                                            onClick={() => {
                                                setSelectedUser(user.id);
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
                </div>
                <button className="admin-pagination-btn">
                    Suivant &gt;
                </button>
            </div>

            {/* Delete Dialog */}
            {deleteDialogOpen && (
                <div className="delete-dialog-overlay" onClick={() => setDeleteDialogOpen(false)}>
                    <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
                        <p className="delete-dialog-text">Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.</p>
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

