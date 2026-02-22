'use client';

import { useState, useEffect, useRef } from 'react';
import { useAlert } from '@/components';
import { SketchPicker, ColorResult } from 'react-color';
import type { ThemeCustomization, ThemeId } from '@/lib/types/theme';
import { themeDefaults } from '@/lib/types/theme';
import Image from 'next/image';
import styles from '../../styles/theme.module.css';

type TabId = 'overview' | 'colors' | 'hero' | 'content' | 'images' | 'layout' | 'typography';

interface ThemeCustomizationData extends ThemeCustomization {
  theme?: ThemeId;
}

export default function ThemeCustomizationEditor() {
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('theme-1');
  const [customization, setCustomization] = useState<ThemeCustomizationData>({} as ThemeCustomizationData);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [isChangingTheme, setIsChangingTheme] = useState(false);
  const [colorErrors, setColorErrors] = useState<Record<string, string>>({});
  const [storeSlug, setStoreSlug] = useState('');
  const [isUpdatingSlug, setIsUpdatingSlug] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Load customization data
  useEffect(() => {
    loadCustomization();
  }, []);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCustomization = async () => {
    try {
      const response = await fetch('/api/theme-customization');
      if (!response.ok) throw new Error('Failed to load customization');
      const data = await response.json();
      setCurrentTheme(data.theme || 'theme-1');

      const infoResponse = await fetch('/api/store-info');
      if (infoResponse.ok) {
        const info = await infoResponse.json();
        setStoreSlug(info.slug || '');
      }

      const defaults = themeDefaults[data.theme || 'theme-1'] || {};
      setCustomization({
        ...defaults,
        ...(data.customization || {}),
        theme: data.theme
      });
    } catch (error) {
      console.error('Error loading customization:', error);
      showAlert('Erreur lors du chargement des personnalisations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSlug = async () => {
    setIsUpdatingSlug(true);
    try {
      const response = await fetch('/api/store-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: storeSlug })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour du lien');
      }
      setNotification({ message: 'Le lien de votre boutique a été mis à jour avec succès.', type: 'success' });
    } catch (error: any) {
      console.error('Error updating slug:', error);
      setNotification({ message: error.message || 'Erreur lors de la mise à jour du lien', type: 'error' });
    } finally {
      setIsUpdatingSlug(false);
    }
  };

  const handleSectionReset = (fieldKeys: Array<keyof ThemeCustomizationData>) => {
    const defaults = themeDefaults[currentTheme] || {};
    const updated = { ...customization };

    fieldKeys.forEach(key => {
      if (key in defaults) {
        (updated as any)[key] = (defaults as any)[key];
      }
    });

    setCustomization(updated);

    // Clear validation errors for these fields
    setColorErrors(prev => {
      const next = { ...prev };
      fieldKeys.forEach(key => delete next[key as string]);
      return next;
    });

    setNotification({ message: 'La section a été réinitialisée aux paramètres d\'origine.', type: 'success' });
  };

  const saveCustomization = async (partial?: Partial<ThemeCustomizationData>) => {
    // Validate all color fields before saving
    const colorFields = ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor', 'headingColor', 'headerBackgroundColor', 'headerTextColor'];
    const errors: Record<string, string> = {};

    colorFields.forEach(field => {
      const val = (partial && partial[field as keyof ThemeCustomizationData]) || customization[field as keyof ThemeCustomizationData];
      const stringValue = typeof val === 'string' ? val : '';
      if (stringValue && !isValidHexColor(stringValue)) {
        errors[field] = 'Format invalide. Utilisez #RRGGBB (ex: #3b82f6) ou rgba(r,g,b,a)';
      }
    });

    if (Object.keys(errors).length > 0) {
      setColorErrors(errors);
      setNotification({ message: 'Veuillez corriger les erreurs de validation avant d\'enregistrer', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const toSave = partial ? { ...customization, ...partial } : customization;
      const { theme, ...customizationData } = toSave;

      const response = await fetch('/api/theme-customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customizationData),
      });

      if (!response.ok) throw new Error('Failed to save customization');

      const result = await response.json();
      setCustomization({ ...customization, ...result.customization });
      setColorErrors({}); // Clear errors on success
      setNotification({ message: 'Vos modifications ont été enregistrées avec succès.', type: 'success' });
    } catch (error) {
      console.error('Error saving customization:', error);
      setNotification({ message: 'Erreur lors de l\'enregistrement', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Validate hex color format
  const isValidHexColor = (color: string): boolean => {
    if (!color) return true; // Allow empty (will use default)
    // Accept hex format: #RGB or #RRGGBB
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)) return true;
    // Accept rgba/rgb format
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(color)) return true;
    return false;
  };

  const updateField = (field: keyof ThemeCustomizationData, value: any) => {
    const updated = { ...customization, [field]: value };
    setCustomization(updated);

    // Validate color fields
    const colorFields = ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor', 'headingColor', 'headerBackgroundColor', 'headerTextColor'];
    if (colorFields.includes(field)) {
      if (value && !isValidHexColor(value)) {
        setColorErrors((prev: Record<string, string>) => ({ ...prev, [field]: 'Format invalide. Utilisez #RRGGBB (ex: #3b82f6) ou rgba(r,g,b,a)' }));
      } else {
        setColorErrors((prev: Record<string, string>) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const hasValidationErrors = (): boolean => {
    return Object.keys(colorErrors).length > 0;
  };

  const handleImageUpload = async (file: File, field: 'heroImageUrl' | 'heroBackgroundUrl' | 'categoryWomanImageUrl' | 'categoryManImageUrl' | 'categoryKidsImageUrl') => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/theme-upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      updateField(field, data.url);
      setNotification({ message: 'L\'image a été téléchargée et mise à jour avec succès.', type: 'success' });
    } catch (error) {
      console.error('Error uploading image:', error);
      setNotification({ message: 'Erreur lors du téléchargement de l\'image', type: 'error' });
    }
  };

  const handleThemeChange = async (themeId: ThemeId) => {
    if (themeId === currentTheme) return;

    setIsChangingTheme(true);
    try {
      const formData = new FormData();
      formData.append('theme', themeId);

      const storeInfoResponse = await fetch('/api/store-info');
      if (!storeInfoResponse.ok) throw new Error('Failed to get store info');
      const storeInfo = await storeInfoResponse.json();

      if (!storeInfo.id) throw new Error('Store ID not found');
      formData.append('storeId', storeInfo.id);

      const updateResponse = await fetch('/api/store-theme', {
        method: 'PUT',
        body: formData,
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update theme');
      }

      setCurrentTheme(themeId);
      await loadCustomization();
      setNotification({ message: 'Le thème a été changé avec succès.', type: 'success' });
    } catch (error: any) {
      console.error('Error changing theme:', error);
      setNotification({ message: error.message || 'Erreur lors du changement de thème', type: 'error' });
    } finally {
      setIsChangingTheme(false);
    }
  };

  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'colors',
      label: 'Couleurs',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'hero',
      label: 'Section Hero',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'content',
      label: 'Contenu',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'images',
      label: 'Images',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'layout',
      label: 'Mise en page',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'typography',
      label: 'Typographie',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 20L10 4M14 20L20 4M3 12H11M13 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className={styles.themeMain}>
        <div className={styles.themeContainer}>
          <div className={styles.loadingContainer}>
            <p className={styles.loadingTitle}>Chargement de l'éditeur...</p>
            <p className={styles.loadingDesc}>Veuillez patienter quelques instants</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.themeMain}>
      <div className={styles.themeContainer}>
        <div className={styles.themeTitleRow}>
          <h1 className={styles.themePageTitle}>Personnalisation du thème</h1>
        </div>

        <div className={styles.themeLayout}>
          <aside className={styles.themeSidebar}>
            <nav className={styles.themeNav}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`${styles.themeNavItem} ${isActive ? styles.active : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div style={{ marginTop: 'auto', padding: '24px 12px 0' }}>
              <button
                onClick={() => saveCustomization()}
                disabled={isSaving || hasValidationErrors()}
                className={styles.themeSubmitBtn}
              >
                {isSaving ? (
                  'Enregistrement...'
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 21.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </aside>

          <div className={styles.themeContent}>
            {activeTab === 'overview' && (
              <OverviewTab
                customization={customization}
                currentTheme={currentTheme}
                onThemeChange={handleThemeChange}
                isChangingTheme={isChangingTheme}
                storeSlug={storeSlug}
                setStoreSlug={setStoreSlug}
                handleUpdateSlug={handleUpdateSlug}
                isUpdatingSlug={isUpdatingSlug}
                onReset={() => handleSectionReset(['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor', 'headingColor', 'headerBackgroundColor', 'headerTextColor', 'heroTitle', 'heroSubtitle', 'heroVariant', 'heroImageUrl', 'heroBackgroundUrl', 'bestSellerTitle', 'productsTitle', 'categoriesTitle', 'categoryWomanImageUrl', 'categoryManImageUrl', 'categoryKidsImageUrl', 'layoutDensity', 'productCardStyle', 'fontFamily', 'headingFontWeight', 'bodyFontWeight'])}
              />
            )}
            {activeTab === 'colors' && (
              <ColorsTab
                customization={customization}
                updateField={updateField}
                showColorPicker={showColorPicker}
                setShowColorPicker={setShowColorPicker}
                colorPickerRef={colorPickerRef}
                currentTheme={currentTheme}
                colorErrors={colorErrors}
                onReset={() => handleSectionReset(['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor', 'headingColor', 'headerBackgroundColor', 'headerTextColor'])}
              />
            )}
            {activeTab === 'hero' && (
              <HeroTab
                customization={customization}
                updateField={updateField}
                handleImageUpload={handleImageUpload}
                onReset={() => handleSectionReset(['heroTitle', 'heroSubtitle', 'heroVariant', 'heroImageUrl', 'heroBackgroundUrl'])}
              />
            )}
            {activeTab === 'content' && (
              <ContentTab
                customization={customization}
                updateField={updateField}
                onReset={() => handleSectionReset(['bestSellerTitle', 'productsTitle', 'categoriesTitle'])}
              />
            )}
            {activeTab === 'images' && (
              <ImagesTab
                customization={customization}
                updateField={updateField}
                handleImageUpload={handleImageUpload}
                onReset={() => handleSectionReset(['categoryWomanImageUrl', 'categoryManImageUrl', 'categoryKidsImageUrl'])}
              />
            )}
            {activeTab === 'layout' && (
              <LayoutTab
                customization={customization}
                updateField={updateField}
                onReset={() => handleSectionReset(['layoutDensity', 'productCardStyle'])}
              />
            )}
            {activeTab === 'typography' && (
              <TypographyTab
                customization={customization}
                updateField={updateField}
                onReset={() => handleSectionReset(['fontFamily', 'headingFontWeight', 'bodyFontWeight'])}
              />
            )}
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {notification && (
        <div className={styles.successOverlay}>
          <div className={styles.successModal}>
            <div className={notification.type === 'success' ? styles.successIcon : styles.errorIcon}>
              {notification.type === 'success' ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <h3 className={styles.successTitle}>
              {notification.type === 'success' ? 'Succès !' : 'Oups !'}
            </h3>
            <p className={styles.successText}>{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className={notification.type === 'success' ? styles.successBtn : styles.errorBtn}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Tab Components
function OverviewTab({
  currentTheme,
  onThemeChange,
  isChangingTheme,
  customization,
  storeSlug,
  setStoreSlug,
  handleUpdateSlug,
  isUpdatingSlug,
  onReset
}: {
  currentTheme: ThemeId;
  onThemeChange: (id: ThemeId) => void;
  isChangingTheme: boolean;
  customization: ThemeCustomizationData;
  storeSlug: string;
  setStoreSlug: (slug: string) => void;
  handleUpdateSlug: () => void;
  isUpdatingSlug: boolean;
  onReset: () => void;
}) {
  const themeDescriptions: Record<ThemeId, string> = {
    'theme-1': 'Minimalist, clean, modern typography',
    'theme-2': 'Bold colors, high contrast, dynamic',
    'theme-3': 'Sophisticated, premium, luxurious',
  };

  const themes: Array<{ id: ThemeId; label: string; image: string }> = [
    { id: 'theme-1', label: 'Modern Minimal', image: '/theme-1.png' },
    { id: 'theme-2', label: 'Bold & Vibrant', image: '/theme-2.png' },
    { id: 'theme-3', label: 'Elegant Dark', image: '/theme-3.png' },
  ];

  return (
    <div className={styles.themeSection}>
      <div className={styles.themeSectionHeader}>
        <div className={styles.themeSectionIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="14" y="3" width="7" height="7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="14" y="14" width="7" height="7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="3" y="14" width="7" height="7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className={styles.themeSectionTitle}>Vue d'ensemble</h3>
          <p className={styles.themeSectionDesc}>Choisissez et personnalisez votre thème</p>
        </div>
        <button type="button" onClick={onReset} className={styles.themeSectionResetBtn} style={{ marginLeft: 'auto' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.49 9A9.5 9.5 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9.5 9.5 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Réinitialiser tout
        </button>
      </div>
      <div className={styles.themeBody}>
        {/* Theme Selection */}
        <div className={styles.themeInputWrapper}>
          <label className={styles.themeInputLabel}>
            <span>Choisir un thème</span>
          </label>
          <div className={styles.themeGrid}>
            {themes.map((theme) => {
              const isActive = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onThemeChange(theme.id)}
                  disabled={isChangingTheme}
                  className={`${styles.themeCard} ${isActive ? styles.active : ''}`}
                >
                  <div className={styles.themeImageWrapper}>
                    <Image
                      src={theme.image}
                      alt={theme.label}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className={styles.themeCardInfo}>
                    <p className={styles.themeCardLabel}>{theme.label}</p>
                    <p className={styles.themeCardDesc}>
                      {themeDescriptions[theme.id]}
                    </p>
                  </div>
                  {isActive && (
                    <div className={styles.activeBadge}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {isChangingTheme && (
            <div style={{ marginTop: '16px', color: '#0d9488', fontSize: '14px', fontWeight: 500 }}>
              Changement de thème en cours...
            </div>
          )}
        </div>

        {/* Current Info */}
        <div className={styles.tipBox}>
          <div className={styles.tipIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={styles.tipContent}>
            <p className={styles.tipText}>
              <strong>Thème actuel:</strong> {themes.find(t => t.id === currentTheme)?.label || 'Par défaut'}
            </p>
            <p className={styles.tipText} style={{ marginTop: '4px' }}>
              <strong>Couleur principale:</strong>{' '}
              <span style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                background: customization.primaryColor || '#3b82f6',
                borderRadius: '4px',
                verticalAlign: 'middle',
                border: '1px solid #e5e7eb',
                marginLeft: '4px'
              }}></span>
              {' '}{customization.primaryColor || '#3b82f6'}
            </p>
          </div>
        </div>

        {/* Slug Update */}
        <div className={styles.themeInputWrapper} style={{ marginTop: '30px' }}>
          <label className={styles.themeInputLabel}>
            <span>Lien de la boutique (Slug)</span>
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className={styles.themeInput}
              value={storeSlug}
              onChange={(e) => setStoreSlug(e.target.value)}
              placeholder="votre-boutique"
            />
            <button
              type="button"
              className={styles.themeSubmitBtn}
              style={{ width: 'auto', padding: '0 20px', minWidth: '120px' }}
              onClick={handleUpdateSlug}
              disabled={isUpdatingSlug || !storeSlug.trim()}
            >
              {isUpdatingSlug ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
          <p style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
            Lien actuel : http://localhost:3000/shop/{storeSlug}
          </p>
        </div>
      </div>
    </div>
  );
}

function ColorsTab({
  customization,
  updateField,
  showColorPicker,
  setShowColorPicker,
  colorPickerRef,
  currentTheme,
  colorErrors,
  onReset
}: {
  customization: ThemeCustomizationData;
  updateField: (field: keyof ThemeCustomizationData, value: any) => void;
  showColorPicker: string | null;
  setShowColorPicker: (field: string | null) => void;
  colorPickerRef: React.RefObject<HTMLDivElement | null>;
  currentTheme: ThemeId;
  colorErrors: Record<string, string>;
  onReset: () => void;
}) {
  const themeDefaultsForCurrentTheme = themeDefaults[currentTheme] || themeDefaults['theme-1'];

  const colorFields = [
    { key: 'primaryColor', label: 'Couleur principale', default: themeDefaultsForCurrentTheme.primaryColor || '#3b82f6' },
    { key: 'secondaryColor', label: 'Couleur secondaire', default: themeDefaultsForCurrentTheme.secondaryColor || '#8b5cf6' },
    { key: 'accentColor', label: 'Couleur d\'accent', default: themeDefaultsForCurrentTheme.accentColor || '#ec4899' },
    { key: 'backgroundColor', label: 'Couleur de fond', default: themeDefaultsForCurrentTheme.backgroundColor || '#ffffff' },
    { key: 'textColor', label: 'Couleur du texte', default: themeDefaultsForCurrentTheme.textColor || '#1f2937' },
    { key: 'headingColor', label: 'Couleur des titres', default: themeDefaultsForCurrentTheme.headingColor || '#111827' },
    { key: 'headerBackgroundColor', label: 'Couleur de fond du header', default: themeDefaultsForCurrentTheme.headerBackgroundColor || (currentTheme === 'theme-3' ? 'rgba(15, 7, 24, 0.98)' : 'rgba(255, 255, 255, 0.98)') },
    { key: 'headerTextColor', label: 'Couleur du texte du header', default: themeDefaultsForCurrentTheme.headerTextColor || (currentTheme === 'theme-3' ? '#ffffff' : '#1f2937') },
  ];

  return (
    <div className={styles.themeSection}>
      <div className={styles.themeSectionHeader}>
        <div className={styles.themeSectionIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className={styles.themeSectionTitle}>Couleurs</h3>
          <p className={styles.themeSectionDesc}>Personnalisez la palette de couleurs de votre boutique</p>
        </div>
        <button type="button" onClick={onReset} className={styles.themeSectionResetBtn} style={{ marginLeft: 'auto' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.49 9A9.5 9.5 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9.5 9.5 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Réinitialiser
        </button>
      </div>
      <div className={styles.themeBody}>
        <div className={styles.colorGrid}>
          {colorFields.map(field => {
            const fieldKey = field.key;
            const hasError = !!colorErrors[fieldKey];
            const currentValue = (customization[fieldKey as keyof ThemeCustomizationData] as string) || '';

            return (
              <div key={fieldKey} className={styles.themeInputWrapper}>
                <label className={styles.themeInputLabel}>
                  <span>{field.label}</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(showColorPicker === fieldKey ? null : fieldKey)}
                      className={styles.colorPreviewBox}
                      style={{
                        background: currentValue || field.default,
                        borderColor: hasError ? '#ef4444' : undefined,
                        width: '60px',
                        height: '40px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      className={styles.themeInput}
                      value={currentValue}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value && !value.startsWith('#') && /^[0-9A-Fa-f]/.test(value)) {
                          value = '#' + value;
                        }
                        updateField(fieldKey as keyof ThemeCustomizationData, value);
                      }}
                      placeholder={field.default}
                      style={{
                        borderColor: hasError ? '#ef4444' : undefined
                      }}
                    />
                    {showColorPicker === fieldKey && (
                      <div ref={colorPickerRef} style={{ position: 'absolute', top: '44px', left: 0, zIndex: 1000 }}>
                        <SketchPicker
                          color={currentValue || field.default}
                          onChange={(color: ColorResult) => updateField(fieldKey as keyof ThemeCustomizationData, color.hex)}
                        />
                      </div>
                    )}
                  </div>
                  {hasError && (
                    <p style={{
                      margin: '4px 0 0 0',
                      fontSize: '13px',
                      color: '#ef4444'
                    }}>
                      {colorErrors[fieldKey]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HeroTab({
  customization,
  updateField,
  handleImageUpload,
  onReset
}: {
  customization: ThemeCustomizationData;
  updateField: (field: keyof ThemeCustomizationData, value: any) => void;
  handleImageUpload: (file: File, field: 'heroImageUrl' | 'heroBackgroundUrl' | 'categoryWomanImageUrl' | 'categoryManImageUrl' | 'categoryKidsImageUrl') => void;
  onReset: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.themeSection}>
      <div className={styles.themeSectionHeader}>
        <div className={styles.themeSectionIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className={styles.themeSectionTitle}>Section Hero</h3>
          <p className={styles.themeSectionDesc}>Personnalisez la section principale de votre boutique</p>
        </div>
        <button type="button" onClick={onReset} className={styles.themeSectionResetBtn} style={{ marginLeft: 'auto' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.49 9A9.5 9.5 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9.5 9.5 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Réinitialiser
        </button>
      </div>
      <div className={styles.themeBody}>
        <div className={styles.themeInputWrapper}>
          <label className={styles.themeInputLabel}>Titre Hero</label>
          <input
            type="text"
            className={styles.themeInput}
            value={customization.heroTitle || ''}
            onChange={(e) => updateField('heroTitle', e.target.value)}
            placeholder="Titre principal"
          />
        </div>
        <div className={styles.themeInputWrapper}>
          <label className={styles.themeInputLabel}>Sous-titre Hero</label>
          <textarea
            className={styles.themeInput}
            value={customization.heroSubtitle || ''}
            onChange={(e) => updateField('heroSubtitle', e.target.value)}
            placeholder="Sous-titre"
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </div>
        <div className={styles.themeInputWrapper}>
          <label className={styles.themeInputLabel}>Style Hero</label>
          <select
            className={styles.themeInput}
            value={customization.heroVariant || 'simple'}
            onChange={(e) => updateField('heroVariant', e.target.value)}
          >
            <option value="simple">Simple</option>
            <option value="circles">Cercles</option>
            <option value="background">Fond</option>
          </select>
        </div>
        <div className={styles.themeInputWrapper}>
          <label className={styles.themeInputLabel}>Image Hero</label>
          {customization.heroImageUrl ? (
            <div className={styles.categoryCard}>
              <div className={styles.categoryImagePreview} style={{ aspectRatio: '16/9' }}>
                <Image src={customization.heroImageUrl} alt="Hero" fill style={{ objectFit: 'cover' }} />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={styles.btnAction}
                style={{ marginTop: '12px' }}
              >
                Changer l'image
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={styles.btnAction}
              style={{
                background: '#f9fafb',
                color: '#6b7280',
                border: '2px dashed #e5e7eb',
                boxShadow: 'none'
              }}
            >
              Télécharger une image
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file, 'heroImageUrl');
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ContentTab({
  customization,
  updateField,
  onReset
}: {
  customization: ThemeCustomizationData;
  updateField: (field: keyof ThemeCustomizationData, value: any) => void;
  onReset: () => void;
}) {
  return (
    <div className={styles.themeSection}>
      <div className={styles.themeSectionHeader}>
        <div className={styles.themeSectionIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className={styles.themeSectionTitle}>Contenu</h3>
          <p className={styles.themeSectionDesc}>Personnalisez les titres et descriptions des sections</p>
        </div>
        <button type="button" onClick={onReset} className={styles.themeSectionResetBtn} style={{ marginLeft: 'auto' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.49 9A9.5 9.5 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9.5 9.5 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Réinitialiser
        </button>
      </div>
      <div className={styles.themeBody}>
        <div className={styles.themeInputWrapper}>
          <label className={styles.themeInputLabel}>Titre "Best Seller"</label>
          <input
            type="text"
            className={styles.themeInput}
            value={customization.bestSellerTitle || ''}
            onChange={(e) => updateField('bestSellerTitle', e.target.value)}
            placeholder="Best Seller"
          />
        </div>
        <div className={styles.themeInputWrapper}>
          <label className={styles.themeInputLabel}>Titre "Products"</label>
          <input
            type="text"
            className={styles.themeInput}
            value={customization.productsTitle || ''}
            onChange={(e) => updateField('productsTitle', e.target.value)}
            placeholder="Products"
          />
        </div>
        <div className={styles.themeInputWrapper}>
          <label className={styles.themeInputLabel}>Titre "Categories"</label>
          <input
            type="text"
            className={styles.themeInput}
            value={customization.categoriesTitle || ''}
            onChange={(e) => updateField('categoriesTitle', e.target.value)}
            placeholder="Categories"
          />
        </div>
      </div>
    </div>
  );
}

function ImagesTab({
  customization,
  updateField,
  handleImageUpload,
  onReset
}: {
  customization: ThemeCustomizationData;
  updateField: (field: keyof ThemeCustomizationData, value: any) => void;
  handleImageUpload: (file: File, field: 'heroImageUrl' | 'heroBackgroundUrl' | 'categoryWomanImageUrl' | 'categoryManImageUrl' | 'categoryKidsImageUrl') => void;
  onReset: () => void;
}) {
  const fileInputRefs = {
    woman: useRef<HTMLInputElement>(null),
    man: useRef<HTMLInputElement>(null),
    kids: useRef<HTMLInputElement>(null),
  };

  const categories = [
    {
      key: 'categoryWomanImageUrl' as const,
      label: 'Femme',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 22V16L9 14V9C9 8.4 9.4 8 10 8H14C14.6 8 15 8.4 15 9V14L17 16V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      ref: fileInputRefs.woman,
      currentImage: customization.categoryWomanImageUrl,
    },
    {
      key: 'categoryManImageUrl' as const,
      label: 'Homme',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 22V16L9 14V9C9 8.4 9.4 8 10 8H14C14.6 8 15 8.4 15 9V14L17 16V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      ref: fileInputRefs.man,
      currentImage: customization.categoryManImageUrl,
    },
    {
      key: 'categoryKidsImageUrl' as const,
      label: 'Enfants',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 22V20C6 17.8 7.8 16 10 16H14C16.2 16 18 17.8 18 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      ref: fileInputRefs.kids,
      currentImage: customization.categoryKidsImageUrl,
    },
  ];

  return (
    <div className={styles.themeSection}>
      <div className={styles.themeSectionHeader}>
        <div className={styles.themeSectionIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 15L16 10L5 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className={styles.themeSectionTitle}>Images de catégories</h3>
          <p className={styles.themeSectionDesc}>Personnalisez les images affichées pour chaque catégorie de produits</p>
        </div>
        <button type="button" onClick={onReset} className={styles.themeSectionResetBtn} style={{ marginLeft: 'auto' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.49 9A9.5 9.5 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9.5 9.5 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Réinitialiser
        </button>
      </div>
      <div className={styles.themeBody}>
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <div key={category.key} className={styles.categoryCard}>
              <div className={styles.categoryCardHeader}>
                <div className={styles.categoryIconWrapper}>
                  {category.icon}
                </div>
                <div>
                  <h4 className={styles.categoryCardTitle}>{category.label}</h4>
                  <p className={styles.categoryCardSubtitle}>Image de catégorie</p>
                </div>
              </div>

              <div className={styles.categoryImagePreview}>
                {category.currentImage ? (
                  <>
                    <Image
                      src={category.currentImage}
                      alt={category.label}
                      fill
                      quality={95}
                      style={{ objectFit: 'cover' }}
                    />
                  </>
                ) : (
                  <div className={styles.emptyImageState}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className={styles.emptyImageTitle}>Aucune image</p>
                  </div>
                )}
              </div>

              <div className={styles.categoryActions}>
                <button
                  type="button"
                  onClick={() => category.ref.current?.click()}
                  className={styles.btnAction}
                >
                  {category.currentImage ? 'Changer' : 'Télécharger'}
                </button>
                {category.currentImage && (
                  <button
                    type="button"
                    onClick={() => updateField(category.key, '')}
                    className={styles.btnRemove}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>

              <input
                ref={category.ref}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, category.key);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LayoutTab({
  customization,
  updateField,
  onReset
}: {
  customization: ThemeCustomizationData;
  updateField: (field: keyof ThemeCustomizationData, value: any) => void;
  onReset: () => void;
}) {
  return (
    <div className={styles.themeSection}>
      <div className={styles.themeSectionHeader}>
        <div className={styles.themeSectionIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className={styles.themeSectionTitle}>Mise en page</h3>
          <p className={styles.themeSectionDesc}>Ajustez la disposition et l'espacement</p>
        </div>
        <button type="button" onClick={onReset} className={styles.themeSectionResetBtn} style={{ marginLeft: 'auto' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.49 9A9.5 9.5 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9.5 9.5 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Réinitialiser
        </button>
      </div>
      <div className={styles.themeBody}>
        <div className={styles.themeInputWrapper}>
          <label className={styles.themeInputLabel}>Densité de la mise en page</label>
          <select
            className={styles.themeInput}
            value={customization.layoutDensity || 'comfortable'}
            onChange={(e) => updateField('layoutDensity', e.target.value)}
          >
            <option value="spacious">Spacieux</option>
            <option value="comfortable">Confortable</option>
            <option value="compact">Compact</option>
          </select>
        </div>
        <div className={styles.themeInputWrapper}>
          <label className={styles.themeInputLabel}>Style des cartes produits</label>
          <select
            className={styles.themeInput}
            value={customization.productCardStyle || 'default'}
            onChange={(e) => updateField('productCardStyle', e.target.value)}
          >
            <option value="default">Par défaut</option>
            <option value="bordered">Bordé</option>
            <option value="shadowed">Ombré</option>
            <option value="gradient">Dégradé</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function TypographyTab({
  customization,
  updateField,
  onReset
}: {
  customization: ThemeCustomizationData;
  updateField: (field: keyof ThemeCustomizationData, value: any) => void;
  onReset: () => void;
}) {
  return (
    <div className={styles.themeSection}>
      <div className={styles.themeSectionHeader}>
        <div className={styles.themeSectionIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 20L10 4M14 20L20 4M3 12H11M13 12H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className={styles.themeSectionTitle}>Typographie</h3>
          <p className={styles.themeSectionDesc}>Choisissez les polices et styles de texte</p>
        </div>
        <button type="button" onClick={onReset} className={styles.themeSectionResetBtn} style={{ marginLeft: 'auto' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.49 9A9.5 9.5 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9.5 9.5 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Réinitialiser
        </button>
      </div>
      <div className={styles.themeBody}>
        <div className={styles.themeInputWrapper}>
          <label className={styles.themeInputLabel}>Famille de police</label>
          <select
            className={styles.themeInput}
            value={customization.fontFamily || 'system'}
            onChange={(e) => updateField('fontFamily', e.target.value)}
          >
            <option value="system">Système</option>
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans-serif</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>
        <div className={styles.themeInputWrapper}>
          <label className={styles.themeInputLabel}>Poids des titres</label>
          <select
            className={styles.themeInput}
            value={customization.headingFontWeight || '700'}
            onChange={(e) => updateField('headingFontWeight', e.target.value)}
          >
            <option value="400">Normal (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi-bold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">Extra-bold (800)</option>
          </select>
        </div>
        <div className={styles.themeInputWrapper}>
          <label className={styles.themeInputLabel}>Poids du texte</label>
          <select
            className={styles.themeInput}
            value={customization.bodyFontWeight || '400'}
            onChange={(e) => updateField('bodyFontWeight', e.target.value)}
          >
            <option value="400">Normal (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi-bold (600)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
