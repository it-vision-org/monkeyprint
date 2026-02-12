// Shared components exports

// UI Components
export { default as MainHeader } from './layout/MainHeader';
export { default as MobileBottomNav } from './layout/MobileBottomNav';
export { default as MobileMenu } from './layout/MobileMenu';
export { default as Navbar } from './layout/Navbar';
export { default as StoreHeader } from './layout/StoreHeader';
export { default as TopHeader } from './layout/TopHeader';

// UI Elements
export { default as AddToCartButton } from './ui/AddToCartButton';
export { default as AlertModal } from './ui/AlertModal';
export { default as CartButton } from './ui/CartButton';
export { default as CategoryCard } from './ui/CategoryCard';
export { default as ConfirmModal } from './ui/ConfirmModal';
export { default as LoadingButton } from './ui/LoadingButton';
export { default as LoadingLink } from './ui/LoadingLink';
export { default as PageHeader } from './ui/PageHeader';
export { default as PageTransition } from './ui/PageTransition';
export { default as ProductCard } from './ui/ProductCard';
export { default as ScrollButtons } from './ui/ScrollButtons';
export { default as SectionTitle } from './ui/SectionTitle';
export { default as StarRating } from './ui/StarRating';
export { default as StepDots } from './ui/StepDots';

// Layouts
export { default as AdminLayout } from './layout/AdminLayout';
export { default as DashboardLayout } from './layout/DashboardLayout';
export { default as DashboardNavigation, dashboardNavItems } from './layout/DashboardNavigation';

// Features
export { default as AllProductsPage } from './features/AllProductsPage';
export { default as CartPage } from './features/CartPage';
export { default as CheckoutPage } from './features/CheckoutPage';
export { default as HomeHero } from './features/HomeHero';
export { default as HowItWorks } from './features/HowItWorks';
export { default as ProductCarousel } from './features/ProductCarousel';
export { default as ProductDetailPage } from './features/ProductDetailPage';
export { default as ProductGrid } from './features/ProductGrid';
export { default as StoresSection } from './features/StoresSection';
export { default as ThemeStorePage } from './features/ThemeStorePage';

// Providers
export { AlertProvider, useAlert } from './providers/AlertContext';
export { CartProvider, useCart } from './providers/CartContext';
export { default as SessionProviderWrapper } from './providers/SessionProviderWrapper';

// Themes
export * from './themes/themeConfig';

// Types
export * from './types';
