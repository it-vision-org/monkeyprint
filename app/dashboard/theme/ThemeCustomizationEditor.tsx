'use client';

import { useState, useEffect, useRef } from 'react';
import { useAlert } from '@/components/AlertContext';
import { SketchPicker, ColorResult } from 'react-color';
import type { ThemeCustomization, ThemeId } from '@/lib/types/theme';
import { themeDefaults } from '@/lib/types/theme';
import Image from 'next/image';

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

  const saveCustomization = async (partial?: Partial<ThemeCustomizationData>) => {
    // Validate all color fields before saving
    const colorFields = ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor', 'headingColor'];
    const errors: Record<string, string> = {};
    
    colorFields.forEach(field => {
      const value = customization[field as keyof ThemeCustomizationData] as string;
      if (value && !isValidHexColor(value)) {
        errors[field] = 'Format de couleur invalide. Utilisez #RRGGBB (ex: #3b82f6)';
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setColorErrors(errors);
      showAlert('Veuillez corriger les erreurs de validation avant d\'enregistrer', 'error');
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
      showAlert('Personnalisations enregistrées avec succès', 'success');
    } catch (error) {
      console.error('Error saving customization:', error);
      showAlert('Erreur lors de l\'enregistrement', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Validate hex color format
  const isValidHexColor = (color: string): boolean => {
    if (!color) return true; // Allow empty (will use default)
    // Remove # if present
    const hex = color.startsWith('#') ? color.slice(1) : color;
    // Must be exactly 6 hex digits
    return /^[0-9A-Fa-f]{6}$/.test(hex);
  };

  const updateField = (field: keyof ThemeCustomizationData, value: any) => {
    const updated = { ...customization, [field]: value };
    setCustomization(updated);
    
    // Validate color fields
    const colorFields = ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor', 'headingColor'];
    if (colorFields.includes(field)) {
      if (value && !isValidHexColor(value)) {
        setColorErrors((prev: Record<string, string>) => ({ ...prev, [field]: 'Format de couleur invalide. Utilisez #RRGGBB (ex: #3b82f6)' }));
      } else {
        setColorErrors((prev: Record<string, string>) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
    // Only update state, don't auto-save - user must click save button
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
      showAlert('Image téléchargée avec succès', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      showAlert('Erreur lors du téléchargement de l\'image', 'error');
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
      // Reload customization with new theme defaults
      await loadCustomization();
      showAlert('Thème mis à jour avec succès', 'success');
    } catch (error: any) {
      console.error('Error changing theme:', error);
      showAlert(error.message || 'Erreur lors du changement de thème', 'error');
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
          <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'colors',
      label: 'Couleurs',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'hero',
      label: 'Section Hero',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'content',
      label: 'Contenu',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'images',
      label: 'Images',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'layout',
      label: 'Mise en page',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'typography',
      label: 'Typographie',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 20L10 4M14 20L20 4M3 12H11M13 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="compte-main">
        <div className="compte-container">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="compte-main">
      <div className="compte-container">
        <div className="compte-title-row">
          <h1 className="compte-page-title">Personnalisation du thème</h1>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '8px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                background: activeTab === tab.id ? '#0d9488' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 600 : 500,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="compte-form-section">
          {activeTab === 'overview' && (
            <OverviewTab 
              customization={customization} 
              currentTheme={currentTheme}
              onThemeChange={handleThemeChange}
              isChangingTheme={isChangingTheme}
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
            />
          )}
          {activeTab === 'hero' && (
            <HeroTab 
              customization={customization} 
              updateField={updateField}
              handleImageUpload={handleImageUpload}
            />
          )}
          {activeTab === 'content' && (
            <ContentTab 
              customization={customization} 
              updateField={updateField}
            />
          )}
          {activeTab === 'images' && (
            <ImagesTab 
              customization={customization} 
              updateField={updateField}
              handleImageUpload={handleImageUpload}
            />
          )}
          {activeTab === 'layout' && (
            <LayoutTab 
              customization={customization} 
              updateField={updateField}
            />
          )}
          {activeTab === 'typography' && (
            <TypographyTab 
              customization={customization} 
              updateField={updateField}
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => saveCustomization()}
          disabled={isSaving || hasValidationErrors()}
          className="compte-submit-btn"
          style={{ 
            marginTop: '24px',
            opacity: hasValidationErrors() ? 0.6 : 1,
            cursor: hasValidationErrors() ? 'not-allowed' : 'pointer'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{isSaving ? 'Enregistrement...' : 'Enregistrer toutes les modifications'}</span>
        </button>
        {hasValidationErrors() && (
          <p style={{ 
            marginTop: '12px', 
            fontSize: '14px', 
            color: '#ef4444',
            textAlign: 'center'
          }}>
            Veuillez corriger les erreurs de validation avant d'enregistrer
          </p>
        )}
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab({ 
  customization, 
  currentTheme,
  onThemeChange,
  isChangingTheme
}: { 
  customization: ThemeCustomizationData; 
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  isChangingTheme: boolean;
}) {
  const themeNames: Record<ThemeId, string> = {
    'theme-1': 'Modern Minimal',
    'theme-2': 'Bold & Vibrant',
    'theme-3': 'Elegant Dark',
  };

  const themeDescriptions: Record<ThemeId, string> = {
    'theme-1': 'Clean, sophisticated, professional',
    'theme-2': 'Energetic, playful, eye-catching',
    'theme-3': 'Sophisticated, premium, luxurious',
  };

  const themes: Array<{ id: ThemeId; label: string; image: string }> = [
    { id: 'theme-1', label: 'Modern Minimal', image: '/theme-1.png' },
    { id: 'theme-2', label: 'Bold & Vibrant', image: '/theme-2.png' },
    { id: 'theme-3', label: 'Elegant Dark', image: '/theme-3.png' },
  ];

  return (
    <div>
      <div className="compte-form-section-header">
        <div className="compte-form-section-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="3" width="7" height="7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="14" width="7" height="7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="14" width="7" height="7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 className="compte-form-section-title">Vue d'ensemble</h3>
          <p className="compte-form-section-desc">Choisissez et personnalisez votre thème</p>
        </div>
      </div>
      <div className="compte-form-body">
        {/* Theme Selection */}
        <div className="compte-input-wrapper" style={{ marginBottom: '32px' }}>
          <label className="compte-input-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Choisir un thème</span>
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            marginTop: '12px' 
          }}>
            {themes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => onThemeChange(theme.id)}
                disabled={isChangingTheme}
                style={{
                  position: 'relative',
                  border: currentTheme === theme.id ? '3px solid #0d9488' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'white',
                  cursor: isChangingTheme ? 'not-allowed' : 'pointer',
                  opacity: isChangingTheme ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ aspectRatio: '16/9', position: 'relative' }}>
                  <Image
                    src={theme.image}
                    alt={theme.label}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '12px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                    {theme.label}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                    {themeDescriptions[theme.id]}
                  </p>
                </div>
                {currentTheme === theme.id && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '24px',
                    height: '24px',
                    background: '#0d9488',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          {isChangingTheme && (
            <p style={{ marginTop: '12px', color: '#666', fontSize: '14px', textAlign: 'center' }}>
              Changement de thème...
            </p>
          )}
        </div>

        {/* Current Theme Info */}
        <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
          <p><strong>Thème actuel:</strong> {themeNames[currentTheme]}</p>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>{themeDescriptions[currentTheme]}</p>
          <p style={{ marginTop: '12px' }}>
            <strong>Couleur principale:</strong>{' '}
            <span style={{ 
              display: 'inline-block', 
              width: '20px', 
              height: '20px', 
              background: customization.primaryColor || '#3b82f6',
              borderRadius: '4px',
              verticalAlign: 'middle',
              marginLeft: '8px',
              border: '1px solid #e5e7eb'
            }}></span>
            {' '}{customization.primaryColor || '#3b82f6'}
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
  colorErrors
}: { 
  customization: ThemeCustomizationData;
  updateField: (field: keyof ThemeCustomizationData, value: any) => void;
  showColorPicker: string | null;
  setShowColorPicker: (field: string | null) => void;
  colorPickerRef: React.RefObject<HTMLDivElement | null>;
  currentTheme: ThemeId;
  colorErrors: Record<string, string>;
}) {
  // Get theme-specific defaults
  const themeDefaultsForCurrentTheme = themeDefaults[currentTheme] || themeDefaults['theme-1'];
  
  const colorFields = [
    { key: 'primaryColor', label: 'Couleur principale', default: themeDefaultsForCurrentTheme.primaryColor || '#3b82f6' },
    { key: 'secondaryColor', label: 'Couleur secondaire', default: themeDefaultsForCurrentTheme.secondaryColor || '#8b5cf6' },
    { key: 'accentColor', label: 'Couleur d\'accent', default: themeDefaultsForCurrentTheme.accentColor || '#ec4899' },
    { key: 'backgroundColor', label: 'Couleur de fond', default: themeDefaultsForCurrentTheme.backgroundColor || '#ffffff' },
    { key: 'textColor', label: 'Couleur du texte', default: themeDefaultsForCurrentTheme.textColor || '#1f2937' },
    { key: 'headingColor', label: 'Couleur des titres', default: themeDefaultsForCurrentTheme.headingColor || '#111827' },
  ];

  return (
    <div>
      <div className="compte-form-section-header">
        <div className="compte-form-section-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 className="compte-form-section-title">Couleurs</h3>
          <p className="compte-form-section-desc">Personnalisez la palette de couleurs de votre boutique</p>
        </div>
      </div>
      <div className="compte-form-body">
        {colorFields.map(field => {
          const fieldKey = field.key;
          const hasError = !!colorErrors[fieldKey];
          const currentValue = (customization[fieldKey as keyof ThemeCustomizationData] as string) || '';
          
          return (
            <div key={fieldKey} className="compte-input-wrapper">
              <label className="compte-input-label">
                <span>{field.label}</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(showColorPicker === fieldKey ? null : fieldKey)}
                    style={{
                      width: '60px',
                      height: '40px',
                      borderRadius: '8px',
                      border: hasError ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      background: currentValue || field.default,
                      cursor: 'pointer',
                    }}
                  />
                  <input
                    type="text"
                    className="compte-input"
                    value={currentValue}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Auto-add # if user types hex without it
                      if (value && !value.startsWith('#') && /^[0-9A-Fa-f]/.test(value)) {
                        value = '#' + value;
                      }
                      updateField(fieldKey as keyof ThemeCustomizationData, value);
                    }}
                    placeholder={field.default}
                    style={{ 
                      flex: 1,
                      borderColor: hasError ? '#ef4444' : undefined
                    }}
                  />
                  {showColorPicker === fieldKey && (
                    <div ref={colorPickerRef} style={{ position: 'absolute', top: '50px', left: 0, zIndex: 1000 }}>
                      <SketchPicker
                        color={currentValue || field.default}
                        onChange={(color: ColorResult) => updateField(fieldKey as keyof ThemeCustomizationData, color.hex)}
                      />
                    </div>
                  )}
                </div>
                {hasError && (
                  <p style={{ 
                    margin: 0, 
                    fontSize: '13px', 
                    color: '#ef4444',
                    paddingLeft: '72px'
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
  );
}

function HeroTab({ 
  customization, 
  updateField,
  handleImageUpload
}: { 
  customization: ThemeCustomizationData;
  updateField: (field: keyof ThemeCustomizationData, value: any) => void;
  handleImageUpload: (file: File, field: 'heroImageUrl' | 'heroBackgroundUrl' | 'categoryWomanImageUrl' | 'categoryManImageUrl' | 'categoryKidsImageUrl') => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div className="compte-form-section-header">
        <div className="compte-form-section-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 className="compte-form-section-title">Section Hero</h3>
          <p className="compte-form-section-desc">Personnalisez la section principale de votre boutique</p>
        </div>
      </div>
      <div className="compte-form-body">
        <div className="compte-input-wrapper">
          <label className="compte-input-label">Titre Hero</label>
          <input
            type="text"
            className="compte-input"
            value={customization.heroTitle || ''}
            onChange={(e) => updateField('heroTitle', e.target.value)}
            placeholder="Titre principal"
          />
        </div>
        <div className="compte-input-wrapper">
          <label className="compte-input-label">Sous-titre Hero</label>
          <textarea
            className="compte-input"
            value={customization.heroSubtitle || ''}
            onChange={(e) => updateField('heroSubtitle', e.target.value)}
            placeholder="Sous-titre"
            rows={3}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
        <div className="compte-input-wrapper">
          <label className="compte-input-label">Style Hero</label>
          <select
            className="compte-input"
            value={customization.heroVariant || 'simple'}
            onChange={(e) => updateField('heroVariant', e.target.value)}
          >
            <option value="simple">Simple</option>
            <option value="circles">Cercles</option>
            <option value="background">Fond</option>
          </select>
        </div>
        <div className="compte-input-wrapper">
          <label className="compte-input-label">Image Hero</label>
          {customization.heroImageUrl ? (
            <div style={{ marginTop: '8px' }}>
              <Image src={customization.heroImageUrl} alt="Hero" width={200} height={200} style={{ borderRadius: '8px' }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} style={{ marginTop: '8px', padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}>
                Changer l'image
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: '12px', border: '2px dashed #e5e7eb', borderRadius: '8px', background: '#f9fafb', cursor: 'pointer', width: '100%' }}>
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

function ContentTab({ customization, updateField }: { customization: ThemeCustomizationData; updateField: (field: keyof ThemeCustomizationData, value: any) => void }) {
  return (
    <div>
      <div className="compte-form-section-header">
        <div className="compte-form-section-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 className="compte-form-section-title">Contenu</h3>
          <p className="compte-form-section-desc">Personnalisez les titres et descriptions des sections</p>
        </div>
      </div>
      <div className="compte-form-body">
        <div className="compte-input-wrapper">
          <label className="compte-input-label">Titre "Best Seller"</label>
          <input
            type="text"
            className="compte-input"
            value={customization.bestSellerTitle || ''}
            onChange={(e) => updateField('bestSellerTitle', e.target.value)}
            placeholder="Best Seller"
          />
        </div>
        <div className="compte-input-wrapper">
          <label className="compte-input-label">Titre "Products"</label>
          <input
            type="text"
            className="compte-input"
            value={customization.productsTitle || ''}
            onChange={(e) => updateField('productsTitle', e.target.value)}
            placeholder="Products"
          />
        </div>
        <div className="compte-input-wrapper">
          <label className="compte-input-label">Titre "Categories"</label>
          <input
            type="text"
            className="compte-input"
            value={customization.categoriesTitle || ''}
            onChange={(e) => updateField('categoriesTitle', e.target.value)}
            placeholder="Categories"
          />
        </div>
      </div>
    </div>
  );
}

function ImagesTab({ customization, updateField, handleImageUpload }: { customization: ThemeCustomizationData; updateField: (field: keyof ThemeCustomizationData, value: any) => void; handleImageUpload: (file: File, field: 'heroImageUrl' | 'heroBackgroundUrl' | 'categoryWomanImageUrl' | 'categoryManImageUrl' | 'categoryKidsImageUrl') => void }) {
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
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 22V16L9 14V9C9 8.4 9.4 8 10 8H14C14.6 8 15 8.4 15 9V14L17 16V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      ref: fileInputRefs.woman,
      currentImage: customization.categoryWomanImageUrl,
      defaultImage: '/Hoodie.png'
    },
    {
      key: 'categoryManImageUrl' as const,
      label: 'Homme',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 22V16L9 14V9C9 8.4 9.4 8 10 8H14C14.6 8 15 8.4 15 9V14L17 16V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      ref: fileInputRefs.man,
      currentImage: customization.categoryManImageUrl,
      defaultImage: '/Hoodie.png'
    },
    {
      key: 'categoryKidsImageUrl' as const,
      label: 'Enfants',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 22V20C6 17.8 7.8 16 10 16H14C16.2 16 18 17.8 18 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      ref: fileInputRefs.kids,
      currentImage: customization.categoryKidsImageUrl,
      defaultImage: '/Hoodie.png'
    },
  ];

  return (
    <div>
      <div className="compte-form-section-header">
        <div className="compte-form-section-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8.5" cy="8.5" r="1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 15L16 10L5 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 className="compte-form-section-title">Images de catégories</h3>
          <p className="compte-form-section-desc">Personnalisez les images affichées pour chaque catégorie de produits</p>
        </div>
      </div>
      <div className="compte-form-body">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px',
          marginTop: '8px'
        }}>
          {categories.map((category) => (
            <div 
              key={category.key}
              style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Category Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0
                }}>
                  {category.icon}
                </div>
                <div>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '18px', 
                    fontWeight: 600, 
                    color: '#111827' 
                  }}>
                    {category.label}
                  </h4>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    fontSize: '13px', 
                    color: '#6b7280' 
                  }}>
                    Image de catégorie
                  </p>
                </div>
              </div>

              {/* Image Preview */}
              <div 
                className="category-image-preview"
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '3/4',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#f9fafb',
                  border: '2px dashed #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {category.currentImage ? (
                  <>
                    <Image
                      src={category.currentImage}
                      alt={category.label}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <div 
                      className="image-overlay"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s'
                      }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'white' }}>
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#9ca3af'
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
                      Aucune image
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                      Utilise l'image par défaut
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => category.ref.current?.click()}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(13, 148, 136, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(13, 148, 136, 0.2)';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {category.currentImage ? 'Changer' : 'Télécharger'}
                </button>
                {category.currentImage && (
                  <button
                    type="button"
                    onClick={() => updateField(category.key, '')}
                    style={{
                      padding: '12px 16px',
                      background: '#f3f4f6',
                      color: '#6b7280',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e5e7eb';
                      e.currentTarget.style.color = '#111827';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.color = '#6b7280';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

        {/* Info Box */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)',
          border: '1px solid #a7f3d0',
          borderRadius: '12px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16V12M12 8H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#065f46' }}>
              Astuce
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: '1.6' }}>
              Les images de catégories sont affichées dans la section "Categories" de votre boutique. 
              Utilisez des images de haute qualité (ratio 3:4 recommandé) pour un meilleur rendu. 
              Si aucune image n'est téléchargée, l'image par défaut sera utilisée.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .category-image-preview:hover .image-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}

function LayoutTab({ customization, updateField }: { customization: ThemeCustomizationData; updateField: (field: keyof ThemeCustomizationData, value: any) => void }) {
  return (
    <div>
      <div className="compte-form-section-header">
        <div className="compte-form-section-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 className="compte-form-section-title">Mise en page</h3>
          <p className="compte-form-section-desc">Ajustez la disposition et l'espacement</p>
        </div>
      </div>
      <div className="compte-form-body">
        <div className="compte-input-wrapper">
          <label className="compte-input-label">Densité de la mise en page</label>
          <select
            className="compte-input"
            value={customization.layoutDensity || 'comfortable'}
            onChange={(e) => updateField('layoutDensity', e.target.value)}
          >
            <option value="spacious">Spacieux</option>
            <option value="comfortable">Confortable</option>
            <option value="compact">Compact</option>
          </select>
        </div>
        <div className="compte-input-wrapper">
          <label className="compte-input-label">Style des cartes produits</label>
          <select
            className="compte-input"
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

function TypographyTab({ customization, updateField }: { customization: ThemeCustomizationData; updateField: (field: keyof ThemeCustomizationData, value: any) => void }) {
  return (
    <div>
      <div className="compte-form-section-header">
        <div className="compte-form-section-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 20L10 4M14 20L20 4M3 12H11M13 12H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 className="compte-form-section-title">Typographie</h3>
          <p className="compte-form-section-desc">Choisissez les polices et styles de texte</p>
        </div>
      </div>
      <div className="compte-form-body">
        <div className="compte-input-wrapper">
          <label className="compte-input-label">Famille de police</label>
          <select
            className="compte-input"
            value={customization.fontFamily || 'system'}
            onChange={(e) => updateField('fontFamily', e.target.value)}
          >
            <option value="system">Système</option>
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans-serif</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>
        <div className="compte-input-wrapper">
          <label className="compte-input-label">Poids des titres</label>
          <select
            className="compte-input"
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
        <div className="compte-input-wrapper">
          <label className="compte-input-label">Poids du texte</label>
          <select
            className="compte-input"
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

