'use client';

export default function AdminDashboardPage() {
    return (
        <>
            <h1 className="dash-page-title">Tableau de bord Admin</h1>
            
            {/* Stats Grid */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-content">
                        <div className="admin-stat-text">
                            <div className="admin-stat-label">Total des Magasins</div>
                            <div className="admin-stat-value">248</div>
                            <div className="admin-stat-change positive">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                +12% ce mois
                            </div>
                        </div>
                        <div className="admin-stat-icon blue">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M9 22V12H15V22" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-content">
                        <div className="admin-stat-text">
                            <div className="admin-stat-label">Total des Utilisateurs</div>
                            <div className="admin-stat-value">1,542</div>
                            <div className="admin-stat-change positive">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                +8% ce mois
                            </div>
                        </div>
                        <div className="admin-stat-icon green">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-content">
                        <div className="admin-stat-text">
                            <div className="admin-stat-label">Commandes Totales</div>
                            <div className="admin-stat-value">8,432</div>
                            <div className="admin-stat-change positive">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                +24% ce mois
                            </div>
                        </div>
                        <div className="admin-stat-icon purple">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <rect x="9" y="3" width="6" height="4" rx="1" stroke="#8b5cf6" strokeWidth="2"/>
                                <path d="M9 12H15" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M9 16H15" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-content">
                        <div className="admin-stat-text">
                            <div className="admin-stat-label">Revenus Totaux</div>
                            <div className="admin-stat-value">421,540</div>
                            <div className="admin-stat-currency">DT</div>
                            <div className="admin-stat-change positive">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                +18% ce mois
                            </div>
                        </div>
                        <div className="admin-stat-icon orange">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="admin-activity-section">
                <h2 className="admin-section-title">Activité récente</h2>
                
                <div className="admin-activity-grid">
                    {/* Recent Stores */}
                    <div className="admin-activity-card">
                        <div className="admin-activity-header">
                            <h3 className="admin-activity-title">Nouveaux Magasins</h3>
                            <a href="/admin/stores" className="admin-activity-link">Voir tout →</a>
                        </div>
                        <div className="admin-activity-list">
                            {[
                                { name: "FashionStore", owner: "Ahmed Ben Ali", date: "Il y a 2 heures", status: "active" },
                                { name: "StyleZone", owner: "Sara Trabelsi", date: "Il y a 5 heures", status: "pending" },
                                { name: "TrendShop", owner: "Mohamed Ammar", date: "Il y a 1 jour", status: "active" },
                                { name: "DesignCo", owner: "Fatma Haddad", date: "Il y a 2 jours", status: "active" },
                            ].map((store, index) => (
                                <div key={index} className="admin-activity-item">
                                    <div className="admin-activity-item-content">
                                        <div className="admin-activity-item-name">{store.name}</div>
                                        <div className="admin-activity-item-detail">{store.owner}</div>
                                        <div className="admin-activity-item-date">{store.date}</div>
                                    </div>
                                    <div className={`admin-activity-badge ${store.status}`}>
                                        {store.status === 'active' ? 'Actif' : 'En attente'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="admin-activity-card">
                        <div className="admin-activity-header">
                            <h3 className="admin-activity-title">Commandes Récentes</h3>
                            <a href="/admin/orders" className="admin-activity-link">Voir tout →</a>
                        </div>
                        <div className="admin-activity-list">
                            {[
                                { id: "#ORD-1234", store: "FashionStore", amount: "150 DT", date: "Il y a 1 heure", status: "pending" },
                                { id: "#ORD-1233", store: "StyleZone", amount: "89 DT", date: "Il y a 3 heures", status: "confirmed" },
                                { id: "#ORD-1232", store: "TrendShop", amount: "234 DT", date: "Il y a 6 heures", status: "confirmed" },
                                { id: "#ORD-1231", store: "DesignCo", amount: "67 DT", date: "Il y a 1 jour", status: "confirmed" },
                            ].map((order, index) => (
                                <div key={index} className="admin-activity-item">
                                    <div className="admin-activity-item-content">
                                        <div className="admin-activity-item-name">{order.id}</div>
                                        <div className="admin-activity-item-detail">{order.store}</div>
                                        <div className="admin-activity-item-date">{order.date}</div>
                                    </div>
                                    <div className="admin-activity-item-amount">{order.amount}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="admin-quick-stats">
                <div className="admin-quick-stat-card">
                    <div className="admin-quick-stat-icon blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="admin-quick-stat-content">
                        <div className="admin-quick-stat-value">3,241</div>
                        <div className="admin-quick-stat-label">Produits Totaux</div>
                    </div>
                </div>

                <div className="admin-quick-stat-card">
                    <div className="admin-quick-stat-icon green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="admin-quick-stat-content">
                        <div className="admin-quick-stat-value">98.2%</div>
                        <div className="admin-quick-stat-label">Taux de Satisfaction</div>
                    </div>
                </div>

                <div className="admin-quick-stat-card">
                    <div className="admin-quick-stat-icon orange">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 8H3M21 8V16C21 16.5304 20.7893 17.0391 20.4142 17.4142C20.0391 17.7893 19.5304 18 19 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V8M21 8L19 3H5L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </div>
                    <div className="admin-quick-stat-content">
                        <div className="admin-quick-stat-value">156</div>
                        <div className="admin-quick-stat-label">Paiements en Attente</div>
                    </div>
                </div>

                <div className="admin-quick-stat-card">
                    <div className="admin-quick-stat-icon purple">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="admin-quick-stat-content">
                        <div className="admin-quick-stat-value">12</div>
                        <div className="admin-quick-stat-label">Thèmes Disponibles</div>
                    </div>
                </div>
            </div>
        </>
    );
}

