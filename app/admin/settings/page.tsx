'use client';

import { useState } from "react";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        siteName: "Monkey Print",
        siteEmail: "admin@monkeyprint.com",
        maintenanceMode: false,
        allowNewStores: true,
        commissionRate: 15,
        maxProductsPerStore: 100,
        enableEmailNotifications: true,
        enableSMSNotifications: false,
    });

    const handleToggle = (key: string) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    const handleInputChange = (key: string, value: string | number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <>
            <h1 className="dash-page-title">Paramètres</h1>

            {/* General Settings */}
            <div className="admin-settings-section">
                <h2 className="admin-settings-section-title">Paramètres Généraux</h2>
                <div className="admin-settings-card">
                    <div className="admin-settings-field">
                        <label className="admin-settings-label">Nom du site</label>
                        <input
                            type="text"
                            className="admin-settings-input"
                            value={settings.siteName}
                            onChange={(e) => handleInputChange('siteName', e.target.value)}
                        />
                    </div>

                    <div className="admin-settings-field">
                        <label className="admin-settings-label">Email administratif</label>
                        <input
                            type="email"
                            className="admin-settings-input"
                            value={settings.siteEmail}
                            onChange={(e) => handleInputChange('siteEmail', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Store Settings */}
            <div className="admin-settings-section">
                <h2 className="admin-settings-section-title">Paramètres des Magasins</h2>
                <div className="admin-settings-card">
                    <div className="admin-settings-field">
                        <label className="admin-settings-label">Taux de commission (%)</label>
                        <input
                            type="number"
                            className="admin-settings-input"
                            value={settings.commissionRate}
                            onChange={(e) => handleInputChange('commissionRate', parseInt(e.target.value) || 0)}
                            min="0"
                            max="100"
                        />
                        <p className="admin-settings-hint">Pourcentage prélevé sur chaque vente</p>
                    </div>

                    <div className="admin-settings-field">
                        <label className="admin-settings-label">Produits maximum par magasin</label>
                        <input
                            type="number"
                            className="admin-settings-input"
                            value={settings.maxProductsPerStore}
                            onChange={(e) => handleInputChange('maxProductsPerStore', parseInt(e.target.value) || 0)}
                            min="1"
                        />
                    </div>

                    <div className="admin-settings-toggle">
                        <div>
                            <label className="admin-settings-label">Autoriser de nouveaux magasins</label>
                            <p className="admin-settings-hint">Permettre aux utilisateurs de créer de nouveaux magasins</p>
                        </div>
                        <button
                            className={`admin-settings-toggle-btn ${settings.allowNewStores ? 'active' : ''}`}
                            onClick={() => handleToggle('allowNewStores')}
                        >
                            <div className="admin-settings-toggle-slider"></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* System Settings */}
            <div className="admin-settings-section">
                <h2 className="admin-settings-section-title">Paramètres Système</h2>
                <div className="admin-settings-card">
                    <div className="admin-settings-toggle">
                        <div>
                            <label className="admin-settings-label">Mode maintenance</label>
                            <p className="admin-settings-hint">Mettre le site en mode maintenance (seuls les admins peuvent accéder)</p>
                        </div>
                        <button
                            className={`admin-settings-toggle-btn ${settings.maintenanceMode ? 'active' : ''}`}
                            onClick={() => handleToggle('maintenanceMode')}
                        >
                            <div className="admin-settings-toggle-slider"></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="admin-settings-section">
                <h2 className="admin-settings-section-title">Notifications</h2>
                <div className="admin-settings-card">
                    <div className="admin-settings-toggle">
                        <div>
                            <label className="admin-settings-label">Notifications par email</label>
                            <p className="admin-settings-hint">Activer les notifications par email pour les administrateurs</p>
                        </div>
                        <button
                            className={`admin-settings-toggle-btn ${settings.enableEmailNotifications ? 'active' : ''}`}
                            onClick={() => handleToggle('enableEmailNotifications')}
                        >
                            <div className="admin-settings-toggle-slider"></div>
                        </button>
                    </div>

                    <div className="admin-settings-toggle">
                        <div>
                            <label className="admin-settings-label">Notifications par SMS</label>
                            <p className="admin-settings-hint">Activer les notifications par SMS pour les administrateurs</p>
                        </div>
                        <button
                            className={`admin-settings-toggle-btn ${settings.enableSMSNotifications ? 'active' : ''}`}
                            onClick={() => handleToggle('enableSMSNotifications')}
                        >
                            <div className="admin-settings-toggle-slider"></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="admin-settings-actions">
                <button className="admin-settings-save-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Enregistrer les modifications
                </button>
            </div>
        </>
    );
}

