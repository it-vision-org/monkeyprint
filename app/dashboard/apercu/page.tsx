export default function ApercuPage() {
    return (
        <>
                    <h1 className="dash-page-title">Aperçu</h1>
                    <div className="apercu-grid">
                        {/* Row 1: Ventes totales & Commandes en attente */}
                        <div className="apercu-card apercu-ventes">
                            <h3 className="apercu-card-label">Ventes totales</h3>
                            <div className="apercu-card-value">
                                <span className="apercu-value">1024</span>
                                <span className="apercu-currency">DT</span>
                            </div>
                            <div className="apercu-change positive">
                                +15%
                            </div>
                            <div className="apercu-card-subtitle">Depuis le mois dernier</div>
                        </div>

                        <div className="apercu-card apercu-commandes">
                            <h3 className="apercu-card-label">Commandes en attente</h3>
                            <div className="apercu-card-value-simple">
                                15
                            </div>
                            <div className="apercu-change negative">
                                -7%
                            </div>
                            <div className="apercu-card-subtitle">Depuis le mois dernier</div>
                        </div>

                        {/* Row 2: Paiement en attente */}
                        <div className="apercu-card apercu-paiement-attente">
                            <h3 className="apercu-card-label">Paiement en attente</h3>
                            <div className="apercu-card-value">
                                <span className="apercu-value">226</span>
                                <span className="apercu-currency">DT</span>
                            </div>
                            <div className="apercu-change positive">
                                +6%
                            </div>
                            <div className="apercu-card-subtitle">Depuis le mois dernier</div>
                        </div>

                        {/* Row 3: Paiement en cours */}
                        <div className="apercu-card apercu-paiement-cours">
                            <div className="apercu-header-row">
                                <h3 className="apercu-card-label">Paiement en cours</h3>
                                <div className="apercu-date">11/06/2025</div>
                            </div>
                            <div className="apercu-subtitle-special">Le montant d&apos;argent que vous pouvez retirer !</div>
                            <div className="apercu-card-value">
                                <span className="apercu-value">150</span>
                                <span className="apercu-currency">DT</span>
                            </div>
                            <div className="apercu-card-notice">Une fois prêt, un courriel vous sera envoyé.</div>
                        </div>

                        {/* Row 4: Commandes retournées */}
                        <div className="apercu-card apercu-retournees">
                            <h3 className="apercu-card-label">Commandes retournées</h3>
                            <div className="apercu-card-value-negative">
                                <span className="apercu-value">-40</span>
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
                                        <span className="apercu-chart-value">1024</span>
                                        <span className="apercu-chart-currency"> DT</span>
                                    </div>
                                </div>
                                <div className="apercu-chart-subtext">
                                    Dernier 30 Jours <span className="apercu-chart-change">+10%</span>
                                </div>

                                {/* Chart Visualization */}
                                <div className="apercu-chart">
                                    <svg viewBox="0 0 600 250" className="apercu-chart-svg" preserveAspectRatio="xMidYMid meet">
                                        {/* Y-axis grid lines */}
                                        <line x1="50" y1="20" x2="50" y2="220" stroke="#e5e7eb" strokeWidth="1"/>
                                        {/* Horizontal grid lines */}
                                        <line x1="50" y1="220" x2="550" y2="220" stroke="#e5e7eb" strokeWidth="1"/>
                                        <line x1="50" y1="180" x2="550" y2="180" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5"/>
                                        <line x1="50" y1="140" x2="550" y2="140" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5"/>
                                        <line x1="50" y1="100" x2="550" y2="100" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5"/>
                                        <line x1="50" y1="60" x2="550" y2="60" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5"/>
                                        <line x1="50" y1="20" x2="550" y2="20" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5"/>
                                        
                                        {/* Y-axis labels */}
                                        <text x="40" y="225" fontSize="12" fill="#9ca3af" textAnchor="end" alignmentBaseline="middle">0</text>
                                        <text x="40" y="185" fontSize="12" fill="#9ca3af" textAnchor="end" alignmentBaseline="middle">100</text>
                                        <text x="40" y="145" fontSize="12" fill="#9ca3af" textAnchor="end" alignmentBaseline="middle">200</text>
                                        <text x="40" y="105" fontSize="12" fill="#9ca3af" textAnchor="end" alignmentBaseline="middle">500</text>
                                        <text x="40" y="65" fontSize="12" fill="#9ca3af" textAnchor="end" alignmentBaseline="middle">1000</text>
                                        
                                        {/* Chart line - starting low in Jan, peaking around Mar/Apr, declining towards Jun */}
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25"/>
                                                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.03"/>
                                            </linearGradient>
                                        </defs>
                                        {/* Area under the line - starts at Jan, peaks at Apr, declines to Jun */}
                                        <path
                                            d="M 80 200 L 140 180 L 200 140 L 260 100 L 320 120 L 380 160 L 440 180 L 500 190 L 500 220 L 80 220 Z"
                                            fill="url(#chartGradient)"
                                        />
                                        {/* Main line */}
                                        <polyline
                                            points="80,200 140,180 200,140 260,100 320,120 380,160 440,180 500,190"
                                            fill="none"
                                            stroke="#0ea5e9"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        
                                        {/* X-axis labels */}
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

