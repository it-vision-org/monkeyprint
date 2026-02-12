'use client';

import {
    useCart,
    LoadingLink,
    AddToCartButton,
    StoreHeader,
    type ThemeConfig
} from "@/components";
import Image from "next/image";
import type { Product, Store } from '@prisma/client';

type Customization = {
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
    backgroundColor?: string | null;
    textColor?: string | null;
    headingColor?: string | null;
    headerBackgroundColor?: string | null;
    headerTextColor?: string | null;
    fontFamily?: string | null;
    headingFontWeight?: string | null;
    bodyFontWeight?: string | null;
};

type ProductPageClientProps = {
    product: Product & { store: Store };
    storeSlug: string;
    theme: ThemeConfig;
    customization?: Customization;
    frontUrl: string | null;
    backUrl: string | null;
};

export default function ProductPageClient({
    product,
    storeSlug,
    theme,
    customization,
    frontUrl,
    backUrl
}: ProductPageClientProps) {
    const { items: cartItems } = useCart();

    // Calculate cart count - filter by store
    const cartCount = cartItems
        .filter(item => item.storeSlug === storeSlug)
        .reduce((sum, item) => sum + item.quantity, 0);

    const getPageClassName = () => {
        const baseClass = 'product-detail-page-modern';
        if (theme.id === 'theme-2') return `${baseClass} product-detail-theme-2`;
        if (theme.id === 'theme-3') return `${baseClass} product-detail-theme-3`;
        return `${baseClass} product-detail-theme-1`;
    };

    // Build CSS variables for dynamic colors
    const cssVariables: React.CSSProperties & Record<string, string> = {};
    if (customization) {
        if (customization.primaryColor) cssVariables['--theme-primary'] = customization.primaryColor;
        if (customization.secondaryColor) cssVariables['--theme-secondary'] = customization.secondaryColor;
        if (customization.accentColor) cssVariables['--theme-accent'] = customization.accentColor;
        if (customization.backgroundColor) cssVariables['--theme-bg'] = customization.backgroundColor;
        if (customization.textColor) cssVariables['--theme-text'] = customization.textColor;
        if (customization.headingColor) cssVariables['--theme-heading'] = customization.headingColor;
        if (customization.headerBackgroundColor) cssVariables['--theme-header-bg'] = customization.headerBackgroundColor;
        if (customization.headerTextColor) cssVariables['--theme-header-text'] = customization.headerTextColor;
    }

    // Use headerTextColor for cart icon if available, otherwise fall back to theme's cartStrokeColor
    const cartIconColor = customization?.headerTextColor || theme.cartStrokeColor || '#1f2937';

    return (
        <div className={getPageClassName()} style={cssVariables}>
            <StoreHeader
                cartCount={cartCount}
                cartHref={`${theme.baseRoute}/cart`}
                logoFilter={theme.logoFilter}
                className={theme.headerClassName}
                containerClassName={theme.containerClassName}
                cartButtonClassName={theme.cartButtonClassName}
                cartBadgeClassName={theme.cartBadgeClassName}
                cartStrokeColor={cartIconColor}
            />

            <div className="product-detail-container-modern">
                <LoadingLink href={`/shop/${storeSlug}`} className="product-detail-back-modern">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Back to Store</span>
                </LoadingLink>

                <div className="product-detail-content-modern">
                    {/* Image Gallery */}
                    <div className="product-detail-gallery-modern">
                        {frontUrl && (
                            <div className="product-detail-image-wrapper-modern">
                                <Image
                                    src={frontUrl}
                                    alt={product.name}
                                    width={600}
                                    height={600}
                                    className="product-detail-image-modern"
                                    priority
                                />
                            </div>
                        )}
                        {backUrl && (
                            <div className="product-detail-image-wrapper-modern">
                                <Image
                                    src={backUrl}
                                    alt={`${product.name} - Back`}
                                    width={600}
                                    height={600}
                                    className="product-detail-image-modern"
                                />
                            </div>
                        )}
                        {!frontUrl && !backUrl && (
                            <div className="product-detail-image-placeholder-modern">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p>No image available</p>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-detail-info-modern">
                        <div className="product-detail-header-modern">
                            <h1 className="product-detail-name-modern">{product.name}</h1>
                            <div className="product-detail-price-modern">{product.basePrice} DT</div>
                        </div>

                        {product.description && (
                            <div className="product-detail-description-section-modern">
                                <h3 className="product-detail-section-title-modern">Description</h3>
                                <p className="product-detail-description-modern">{product.description}</p>
                            </div>
                        )}

                        <div className="product-detail-add-to-cart-modern">
                            <AddToCartButton
                                product={product}
                                frontUrl={frontUrl}
                                storeName={product.store.name}
                                storeSlug={storeSlug}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

