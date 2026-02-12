const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/Dainor/Downloads/Mo/monkeyprint/components';

const moves = [
    // UI
    { from: 'AddToCartButton.tsx', to: 'ui/AddToCartButton.tsx' },
    { from: 'AlertModal.tsx', to: 'ui/AlertModal.tsx' },
    { from: 'ConfirmModal.tsx', to: 'ui/ConfirmModal.tsx' },
    { from: 'CategoryCard.tsx', to: 'ui/CategoryCard.tsx' },
    { from: 'LoadingButton.tsx', to: 'ui/LoadingButton.tsx' },
    { from: 'LoadingLink.tsx', to: 'ui/LoadingLink.tsx' },
    { from: 'PageHeader.tsx', to: 'ui/PageHeader.tsx' },
    { from: 'PageTransition.tsx', to: 'ui/PageTransition.tsx' },
    { from: 'ProductCard.tsx', to: 'ui/ProductCard.tsx' },
    { from: 'ScrollButtons.tsx', to: 'ui/ScrollButtons.tsx' },
    { from: 'SectionTitle.tsx', to: 'ui/SectionTitle.tsx' },
    { from: 'StarRating.tsx', to: 'ui/StarRating.tsx' },
    { from: 'StepDots.tsx', to: 'ui/StepDots.tsx' },
    { from: 'CartButton.tsx', to: 'ui/CartButton.tsx' },

    // Layout
    { from: 'AdminLayout.tsx', to: 'layout/AdminLayout.tsx' },
    { from: 'DashboardLayout.tsx', to: 'layout/DashboardLayout.tsx' },
    { from: 'DashboardNavigation.tsx', to: 'layout/DashboardNavigation.tsx' },
    { from: 'MainHeader.tsx', to: 'layout/MainHeader.tsx' },
    { from: 'MainHeader.module.css', to: 'layout/MainHeader.module.css' },
    { from: 'MobileBottomNav.tsx', to: 'layout/MobileBottomNav.tsx' },
    { from: 'MobileMenu.tsx', to: 'layout/MobileMenu.tsx' },
    { from: 'Navbar.tsx', to: 'layout/Navbar.tsx' },
    { from: 'TopHeader.tsx', to: 'layout/TopHeader.tsx' },
    { from: 'StoreHeader.tsx', to: 'layout/StoreHeader.tsx' },

    // Providers
    { from: 'AlertContext.tsx', to: 'providers/AlertContext.tsx' },
    { from: 'CartContext.tsx', to: 'providers/CartContext.tsx' },
    { from: 'SessionProviderWrapper.tsx', to: 'providers/SessionProviderWrapper.tsx' },

    // Features
    { from: 'AllProductsPage.tsx', to: 'features/AllProductsPage.tsx' },
    { from: 'CartPage.tsx', to: 'features/CartPage.tsx' },
    { from: 'CheckoutPage.tsx', to: 'features/CheckoutPage.tsx' },
    { from: 'HomeHero.tsx', to: 'features/HomeHero.tsx' },
    { from: 'HomeHero.module.css', to: 'features/HomeHero.module.css' },
    { from: 'HowItWorks.tsx', to: 'features/HowItWorks.tsx' },
    { from: 'HowItWorks.module.css', to: 'features/HowItWorks.module.css' },
    { from: 'ProductCarousel.tsx', to: 'features/ProductCarousel.tsx' },
    { from: 'ProductDetailPage.tsx', to: 'features/ProductDetailPage.tsx' },
    { from: 'ProductGrid.tsx', to: 'features/ProductGrid.tsx' },
    { from: 'StoresSection.tsx', to: 'features/StoresSection.tsx' },
    { from: 'StoresSection.module.css', to: 'features/StoresSection.module.css' },
    { from: 'ThemeStorePage.tsx', to: 'features/ThemeStorePage.tsx' },
];

moves.forEach(m => {
    const fromPath = path.join(baseDir, m.from);
    const toPath = path.join(baseDir, m.to);

    if (fs.existsSync(fromPath)) {
        try {
            fs.renameSync(fromPath, toPath);
            console.log(`Moved ${m.from} to ${m.to}`);
        } catch (e) {
            console.error(`Failed to move ${m.from}: ${e.message}`);
        }
    } else {
        console.warn(`File not found: ${m.from}`);
    }
});
