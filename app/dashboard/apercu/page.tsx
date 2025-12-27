'use client';

import Image from "next/image";
import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function ApercuPage() {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [commandesOpen, setCommandesOpen] = useState(false);
    const [themeModalOpen, setThemeModalOpen] = useState(false);

    return (
        <div className="dashboard-page">
            {/* Header */}
            <header className="dash-header">
                <div className="dash-container">
                    <div className="dash-logo">
                        DASHBOARD
                    </div>
                    <nav className="dash-nav">
                        <a href="/dashboard/apercu" className="dash-nav-link active">APERÇU</a>
                        <a href="/dashboard/produits" className="dash-nav-link">PRODUITS</a>
                        <a href="/dashboard/commandes" className="dash-nav-link">COMMANDES</a>
                        <a href="/dashboard/portefeuille" className="dash-nav-link">PORTEFEUILLE</a>
                    </nav>
                    <div className="dash-actions">
                        <button className="dash-visit-btn" onClick={() => setThemeModalOpen(true)}>VISITER LE MAGASIN</button>
                        <button className="dash-user-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    <button className="dash-mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12H21M3 6H21M3 18H21" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </header>

            {mobileMenuOpen && (
                <>
                    <div className="dash-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
                    <div className={`dash-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                        <div className="dash-mobile-menu-header">
                            <button className="dash-visit-btn-mobile" onClick={() => {
                                setMobileMenuOpen(false);
                                setThemeModalOpen(true);
                            }}>VISITER LE MAGASIN</button>
                            <button className="dash-mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        
                        <nav className="dash-mobile-nav">
                            <a href="/dashboard/apercu" className="dash-mobile-nav-item active">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Aperçu
                            </a>
                            <a href="/dashboard/produits" className="dash-mobile-nav-item">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Produits
                            </a>
                            <div className="dash-mobile-nav-section">
                                <button 
                                    className="dash-mobile-nav-item commandes-toggle"
                                    onClick={() => setCommandesOpen(!commandesOpen)}
                                >
                                    <div className="dash-mobile-nav-item-left">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                                            <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        Commandes
                                    </div>
                                    <svg 
                                        width="20" 
                                        height="20" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`dash-mobile-chevron ${commandesOpen ? 'open' : ''}`}
                                    >
                                        <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                {commandesOpen && (
                                    <div className="dash-mobile-submenu">
                                        <a href="/dashboard/commandes?status=non-confirme" className="dash-mobile-submenu-item">
                                            <span className="dash-submenu-dot orange"></span>
                                            Non confirmé
                                        </a>
                                        <a href="/dashboard/commandes?status=confirme" className="dash-mobile-submenu-item">
                                            <span className="dash-submenu-dot green"></span>
                                            Confirmé
                                        </a>
                                        <a href="/dashboard/commandes?status=retours" className="dash-mobile-submenu-item">
                                            <span className="dash-submenu-dot red"></span>
                                            Retours
                                        </a>
                                    </div>
                                )}
                            </div>
                            <a href="/dashboard/portefeuille" className="dash-mobile-nav-item">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 8H3M21 8V16C21 16.5304 20.7893 17.0391 20.4142 17.4142C20.0391 17.7893 19.5304 18 19 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V8M21 8L19 3H5L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                Portefeuille
                            </a>
                            <a href="/dashboard/compte" className="dash-mobile-nav-item">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Compte
                            </a>
                            <a href="/dashboard/parametres" className="dash-mobile-nav-item bordered">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Paramètres
                            </a>
                            <a href="/logout" className="dash-mobile-nav-item logout">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Se déconnecter
                            </a>
                        </nav>

                        <div className="dash-mobile-logo">
                            <Image src="/logo.png" alt="Monkey Print" width={180} height={60} style={{ objectFit: 'contain' }} />
                        </div>
                    </div>
                </>
            )}


            {/* Main Content */}
            <main className="dash-main">
                <div className="dash-container">
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
                </div>
            </main>

            {/* Theme Selection Modal */}
            {themeModalOpen && (
                <div className="delete-dialog-overlay" onClick={() => setThemeModalOpen(false)}>
                    <div className="theme-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="theme-modal-title">Choisissez votre thème</h3>
                        <div className="theme-modal-grid">
                            <div className="theme-modal-card" onClick={() => router.push('/store/theme-1')}>
                                <div className="theme-modal-preview">
                                    <Image src="/theme-1.png" alt="Theme 1" width={200} height={300} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                                </div>
                                <p className="theme-modal-name">Thème 1</p>
                            </div>
                            <div className="theme-modal-card" onClick={() => router.push('/store/theme-2')}>
                                <div className="theme-modal-preview">
                                    <Image src="/theme-2.png" alt="Theme 2" width={200} height={300} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                                </div>
                                <p className="theme-modal-name">Thème 2</p>
                            </div>
                            <div className="theme-modal-card" onClick={() => router.push('/store/theme-3')}>
                                <div className="theme-modal-preview">
                                    <Image src="/theme-3.png" alt="Theme 3" width={200} height={300} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                                </div>
                                <p className="theme-modal-name">Thème 3</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

