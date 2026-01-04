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
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#ec4899',
    heroVariant: 'simple',
    bestSellerTitle: 'Best Seller',
    productsTitle: 'Products',
    categoriesTitle: 'Categories',
    layoutDensity: 'comfortable',
    productCardStyle: 'default',
    gridColumns: 2,
    fontFamily: 'system',
    headingFontWeight: '700',
    bodyFontWeight: '400',
  },
  'theme-2': {
    primaryColor: '#f59e0b',
    secondaryColor: '#ef4444',
    accentColor: '#8b5cf6',
    heroVariant: 'circles',
    bestSellerTitle: 'Best Seller',
    productsTitle: 'Products',
    categoriesTitle: 'Categories',
    layoutDensity: 'compact',
    productCardStyle: 'gradient',
    gridColumns: 2,
    fontFamily: 'system',
    headingFontWeight: '800',
    bodyFontWeight: '500',
  },
  'theme-3': {
    primaryColor: '#ffffff',
    secondaryColor: '#a855f7',
    accentColor: '#ec4899',
    backgroundColor: '#0f172a',
    textColor: '#f1f5f9',
    headingColor: '#ffffff',
    heroVariant: 'background',
    bestSellerTitle: 'Best Seller',
    productsTitle: 'Products',
    categoriesTitle: 'Categories',
    layoutDensity: 'spacious',
    productCardStyle: 'shadowed',
    gridColumns: 2,
    fontFamily: 'system',
    headingFontWeight: '700',
    bodyFontWeight: '400',
  },
};

