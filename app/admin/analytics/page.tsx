'use client';

export default function AdminAnalyticsPage() {
    return (
        <>
            <h1 className="dash-page-title">Analytiques</h1>
            
            {/* Analytics Cards */}
            <div className="admin-analytics-grid">
                <div className="admin-analytics-card">
                    <h3 className="admin-analytics-card-title">Revenus par Mois</h3>
                    <div className="admin-analytics-chart">
                        <svg viewBox="0 0 600 300" className="admin-chart-svg" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3"/>
                                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.05"/>
                                </linearGradient>
                            </defs>
                            {/* Grid lines */}
                            <line x1="50" y1="50" x2="50" y2="250" stroke="#e5e7eb" strokeWidth="2"/>
                            <line x1="50" y1="250" x2="550" y2="250" stroke="#e5e7eb" strokeWidth="2"/>
                            {/* Area */}
                            <path
                                d="M 80 200 L 140 180 L 200 150 L 260 120 L 320 100 L 380 140 L 440 160 L 500 170 L 500 250 L 80 250 Z"
                                fill="url(#revenueGradient)"
                            />
                            {/* Line */}
                            <polyline
                                points="80,200 140,180 200,150 260,120 320,100 380,140 440,160 500,170"
                                fill="none"
                                stroke="#0d9488"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {/* Labels */}
                            <text x="80" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Jan</text>
                            <text x="200" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Mar</text>
                            <text x="320" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Mai</text>
                            <text x="440" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Jul</text>
                        </svg>
                    </div>
                </div>

                <div className="admin-analytics-card">
                    <h3 className="admin-analytics-card-title">Commandes par Mois</h3>
                    <div className="admin-analytics-chart">
                        <svg viewBox="0 0 600 300" className="admin-chart-svg" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <linearGradient id="ordersGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3"/>
                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05"/>
                                </linearGradient>
                            </defs>
                            {/* Grid lines */}
                            <line x1="50" y1="50" x2="50" y2="250" stroke="#e5e7eb" strokeWidth="2"/>
                            <line x1="50" y1="250" x2="550" y2="250" stroke="#e5e7eb" strokeWidth="2"/>
                            {/* Area */}
                            <path
                                d="M 80 220 L 140 200 L 200 160 L 260 140 L 320 120 L 380 150 L 440 180 L 500 190 L 500 250 L 80 250 Z"
                                fill="url(#ordersGradient)"
                            />
                            {/* Line */}
                            <polyline
                                points="80,220 140,200 200,160 260,140 320,120 380,150 440,180 500,190"
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {/* Labels */}
                            <text x="80" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Jan</text>
                            <text x="200" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Mar</text>
                            <text x="320" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Mai</text>
                            <text x="440" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Jul</text>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Top Stores */}
            <div className="admin-analytics-section">
                <h2 className="admin-section-title">Top Magasins</h2>
                <div className="admin-top-stores">
                    {[
                        { name: "TrendShop", revenue: "28,320 DT", orders: 567, growth: "+24%" },
                        { name: "EcoFashion", revenue: "20,600 DT", orders: 412, growth: "+18%" },
                        { name: "FashionStore", revenue: "12,450 DT", orders: 234, growth: "+15%" },
                        { name: "VintageVibes", revenue: "16,050 DT", orders: 321, growth: "+12%" },
                        { name: "DesignCo", revenue: "9,450 DT", orders: 189, growth: "+8%" },
                    ].map((store, index) => (
                        <div key={index} className="admin-top-store-card">
                            <div className="admin-top-store-rank">#{index + 1}</div>
                            <div className="admin-top-store-info">
                                <div className="admin-top-store-name">{store.name}</div>
                                <div className="admin-top-store-stats">
                                    <span>Revenus: {store.revenue}</span>
                                    <span>Commandes: {store.orders}</span>
                                    <span className="admin-top-store-growth positive">{store.growth}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Product Categories */}
            <div className="admin-analytics-section">
                <h2 className="admin-section-title">Catégories de Produits</h2>
                <div className="admin-categories-grid">
                    {[
                        { name: "T-Shirts", count: 1245, percentage: 45 },
                        { name: "Hoodies", count: 892, percentage: 32 },
                        { name: "Accessoires", count: 623, percentage: 23 },
                    ].map((category, index) => (
                        <div key={index} className="admin-category-card">
                            <div className="admin-category-header">
                                <h3 className="admin-category-name">{category.name}</h3>
                                <div className="admin-category-count">{category.count}</div>
                            </div>
                            <div className="admin-category-bar">
                                <div 
                                    className="admin-category-bar-fill" 
                                    style={{ width: `${category.percentage}%` }}
                                ></div>
                            </div>
                            <div className="admin-category-percentage">{category.percentage}%</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

