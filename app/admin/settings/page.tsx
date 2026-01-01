'use client';

import { useState, useEffect } from "react";

const DEFAULT_SETTINGS = {
    siteName: "Monkey Print",
    siteEmail: "admin@monkeyprint.com",
    maintenanceMode: false,
    allowNewStores: true,
    commissionRate: 15,
    maxProductsPerStore: 100,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
};

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        // Load settings from API
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings) {
                    // Merge with defaults to ensure all keys are present
                    setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error loading settings:', err);
                setIsLoading(false);
            });
    }, []);

    const handleToggle = (key: string) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    const handleInputChange = (key: string, value: string | number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ settings }),
            });

            const data = await response.json();

            if (response.ok) {
                setSaveMessage({ type: 'success', text: 'Paramètres enregistrés avec succès' });
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                setSaveMessage({ type: 'error', text: data.error || 'Erreur lors de l\'enregistrement' });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setSaveMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <h1 className="dash-page-title">Paramètres</h1>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    Chargement...
                </div>
            </>
        );
    }

    return (
        <>
            <h1 className="dash-page-title">Paramètres</h1>
            
            {saveMessage && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    background: saveMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
                    color: saveMessage.type === 'success' ? '#065f46' : '#991b1b',
                    fontSize: '14px',
                    fontWeight: 500
                }}>
                    {saveMessage.text}
                </div>
            )}

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
                <button 
                    className="admin-settings-save-btn"
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ opacity: isSaving ? 0.6 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
            </div>
        </>
    );
}

