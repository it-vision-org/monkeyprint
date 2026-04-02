export type ThemeId = 'theme-1' | 'theme-2' | 'theme-3';

export type HeroVariant = 'simple' | 'circles' | 'background';

export type LayoutDensity = 'spacious' | 'comfortable' | 'compact';

export type ProductCardStyle = 'default' | 'bordered' | 'shadowed' | 'gradient';

export type FontFamily = 'system' | 'serif' | 'sans-serif' | 'monospace';

export interface ThemeCustomizationColors {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingColor?: string;
}

export interface ThemeCustomizationHero {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  heroBackgroundUrl?: string;
  heroVariant?: HeroVariant;
  heroCtaText?: string;
  heroCtaLink?: string;
}

export interface ThemeCustomizationContent {
  bestSellerTitle?: string;
  productsTitle?: string;
  categoriesTitle?: string;
  bestSellerDesc?: string;
  productsDesc?: string;
  categoriesDesc?: string;
  categoryWomanImageUrl?: string;
  categoryManImageUrl?: string;
  categoryKidsImageUrl?: string;
}

export interface ThemeCustomizationLayout {
  layoutDensity?: LayoutDensity;
  productCardStyle?: ProductCardStyle;
  gridColumns?: number;
}

export interface ThemeCustomizationTypography {
  fontFamily?: FontFamily;
  headingFontWeight?: string;
  bodyFontWeight?: string;
}

export interface ThemeCustomization {
  // Colors
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingColor?: string;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  
  // Hero Section
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  heroBackgroundUrl?: string;
  heroVariant?: HeroVariant;
  heroCtaText?: string;
  heroCtaLink?: string;
  
  // Content
  bestSellerTitle?: string;
  productsTitle?: string;
  categoriesTitle?: string;
  bestSellerDesc?: string;
  productsDesc?: string;
  categoriesDesc?: string;
  
  // Category Images
  categoryWomanImageUrl?: string;
  categoryManImageUrl?: string;
  categoryKidsImageUrl?: string;
  
  // Layout & Spacing
  layoutDensity?: LayoutDensity;
  productCardStyle?: ProductCardStyle;
  gridColumns?: number;
  
  // Typography
  fontFamily?: FontFamily;
  headingFontWeight?: string;
  bodyFontWeight?: string;
  
  // Theme-specific settings (JSON string)
  themeSettings?: string;
}

export interface ThemeCustomizationDefaults {
  [key: string]: Partial<ThemeCustomization>;
}

// Default customization values for each theme
export const themeDefaults: ThemeCustomizationDefaults = {
  'theme-1': {
    primaryColor: '#0ea5e9', // Sky Blue
    secondaryColor: '#3b82f6', // Blue
    accentColor: '#6366f1', // Indigo
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    headingColor: '#0f172a',
    headerBackgroundColor: 'rgba(255, 255, 255, 0.98)',
    headerTextColor: '#1f2937',
    heroVariant: 'simple',
    heroImageUrl: '/hero1.png',
    bestSellerTitle: 'Meilleures ventes',
    productsTitle: 'Produits',
    categoriesTitle: 'Catégories',
    layoutDensity: 'comfortable',
    productCardStyle: 'default',
    gridColumns: 2,
    fontFamily: 'system',
    headingFontWeight: '800',
    bodyFontWeight: '400',
  },
  'theme-2': {
    primaryColor: '#fb923c', // Coral
    secondaryColor: '#f472b6', // Magenta
    accentColor: '#a855f7', // Purple
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    headingColor: '#111827',
    headerBackgroundColor: 'rgba(255, 255, 255, 0.98)',
    headerTextColor: '#1f2937',
    heroVariant: 'circles',
    heroImageUrl: '/hero2.png',
    bestSellerTitle: 'Meilleures ventes',
    productsTitle: 'Produits',
    categoriesTitle: 'Catégories',
    layoutDensity: 'compact',
    productCardStyle: 'gradient',
    gridColumns: 2,
    fontFamily: 'system',
    headingFontWeight: '900',
    bodyFontWeight: '500',
  },
  'theme-3': {
    primaryColor: '#8b5cf6', // Deep Purple
    secondaryColor: '#ec4899', // Pink
    accentColor: '#f472b6', // Rose
    backgroundColor: '#0f0718', // Very Dark Purple
    textColor: '#e2e8f0',
    headingColor: '#ffffff',
    headerBackgroundColor: 'rgba(15, 7, 24, 0.98)',
    headerTextColor: '#ffffff',
    heroVariant: 'background',
    heroImageUrl: '/hero3.png',
    bestSellerTitle: 'Meilleures ventes',
    productsTitle: 'Produits',
    categoriesTitle: 'Catégories',
    layoutDensity: 'spacious',
    productCardStyle: 'shadowed',
    gridColumns: 2,
    fontFamily: 'system',
    headingFontWeight: '800',
    bodyFontWeight: '400',
  },
};

