export type ThemeConfig = {
    id: string;
    baseRoute: string;
    pageClassName: string;
    headerClassName: string;
    containerClassName: string;
    cartButtonClassName: string;
    cartBadgeClassName: string;
    heroClassName?: string;
    sectionClassName?: string;
    sectionTitleClassName?: string;
    productCardClassName?: string;
    productImageClassName?: string;
    productNameClassName?: string;
    productPriceClassName?: string;
    productRatingClassName?: string;
    categoryClassName?: string;
    categoryLabelClassName?: string;
    viewAllClassName?: string;
    scrollButtonClassName?: string;
    logoFilter?: string;
    cartStrokeColor?: string;
};

export const themeConfigs: Record<string, ThemeConfig> = {
    'theme-1': {
        id: 'theme-1',
        baseRoute: '/store/theme-1',
        pageClassName: 'theme-1-page',
        headerClassName: 'theme-1-header',
        containerClassName: 'theme-1-container',
        cartButtonClassName: 'theme-1-cart-btn',
        cartBadgeClassName: 'theme-1-cart-badge',
        heroClassName: 'theme-1-hero',
        sectionClassName: 'theme-1-section',
        sectionTitleClassName: 'theme-1-section-title',
        productCardClassName: 'theme-1-product-card',
        productImageClassName: 'theme-1-product-image',
        productNameClassName: 'theme-1-product-name',
        productPriceClassName: 'theme-1-product-price',
        productRatingClassName: 'theme-1-product-rating',
        categoryClassName: 'theme-1-category',
        categoryLabelClassName: 'theme-1-category-label',
        viewAllClassName: 'theme-1-view-all',
        scrollButtonClassName: 'theme-1-scroll-btn',
    },
    'theme-2': {
        id: 'theme-2',
        baseRoute: '/store/theme-2',
        pageClassName: 'theme-2-page',
        headerClassName: 'theme-2-header',
        containerClassName: 'theme-2-container',
        cartButtonClassName: 'theme-2-cart-btn',
        cartBadgeClassName: 'theme-2-cart-badge',
        heroClassName: 'theme-2-hero',
        sectionClassName: 'theme-2-section',
        sectionTitleClassName: 'theme-2-section-title',
        productCardClassName: 'theme-2-product-card',
        productImageClassName: 'theme-2-product-image',
        productNameClassName: 'theme-2-product-name',
        productPriceClassName: 'theme-2-product-price',
        productRatingClassName: 'theme-2-product-rating',
        categoryClassName: 'theme-2-category',
        categoryLabelClassName: 'theme-2-category-label',
        viewAllClassName: 'theme-2-view-all',
        scrollButtonClassName: 'theme-2-scroll-btn',
    },
    'theme-3': {
        id: 'theme-3',
        baseRoute: '/store/theme-3',
        pageClassName: 'theme-3-page',
        headerClassName: 'theme-3-header',
        containerClassName: 'theme-3-container',
        cartButtonClassName: 'theme-3-cart-btn',
        cartBadgeClassName: 'theme-3-cart-badge',
        heroClassName: 'theme-3-hero',
        sectionClassName: 'theme-3-section',
        sectionTitleClassName: 'theme-3-section-title',
        productCardClassName: 'theme-3-product-card',
        productImageClassName: 'theme-3-product-image',
        productNameClassName: 'theme-3-product-name',
        productPriceClassName: 'theme-3-product-price',
        productRatingClassName: 'theme-3-product-rating',
        categoryClassName: 'theme-3-category',
        categoryLabelClassName: 'theme-3-category-label',
        viewAllClassName: 'theme-3-view-all',
        scrollButtonClassName: 'theme-3-scroll-btn',
        logoFilter: 'brightness(0) invert(1)',
        cartStrokeColor: '#ffffff',
    },
};
