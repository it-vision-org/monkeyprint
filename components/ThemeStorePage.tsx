'use client';

import { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import StoreHeader from '@/components/StoreHeader';
import ProductCarousel from '@/components/ProductCarousel';
import ProductGrid from '@/components/ProductGrid';
import CategoryCard from '@/components/CategoryCard';
import SectionTitle from '@/components/SectionTitle';
import type { Product } from '@/components/types';
import type { ThemeConfig } from './themeConfig';
import { useCart } from '@/components/CartContext';

type ThemeStorePageProps = {
    theme: ThemeConfig;
    products: Product[];
    heroContent: {
        title: string;
        subtitle: string;
        image?: string;
        imageWidth?: number;
        imageHeight?: number;
        variant?: 'simple' | 'circles' | 'background';
        circles?: Array<{ src: string; className: string }>;
        backgroundImage?: string;
    };
    categories: Array<{
        image: string;
        alt: string;
        label: string;
        imageWidth: number;
        imageHeight: number;
        className?: string;
    }>;
    sections?: Array<{
        title: string;
        type: 'best-seller' | 'products';
        products?: Product[];
        showViewAll?: boolean;
    }>;
    customization?: {
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
    storeSlug?: string; // Optional store slug to filter cart items
};

export default function ThemeStorePage({
    theme,
    products,
    heroContent,
    categories,
    sections = [],
    customization,
    storeSlug
}: ThemeStorePageProps) {
    const router = useRouter();
    const { items: cartItems } = useCart();
    
    // Calculate cart count - filter by store if storeSlug provided, otherwise show all
    const cartCount = storeSlug
        ? cartItems.filter(item => item.storeSlug === storeSlug).reduce((sum, item) => sum + item.quantity, 0)
        : cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

    const renderHero = () => {
        if (theme.id === 'theme-1') {
            // Check if background variant is selected
            if (heroContent.variant === 'background') {
                return (
                    <div className={theme.heroClassName}>
                        {heroContent.backgroundImage && (
                            <Image 
                                src={heroContent.backgroundImage} 
                                alt="Background" 
                                width={1200} 
                                height={600} 
                                quality={95}
                                sizes="100vw"
                                className="theme-1-hero-bg-image" 
                            />
                        )}
                        <div className="theme-1-hero-content">
                            <h1 className="theme-1-hero-title">{heroContent.title}</h1>
                            <p className="theme-1-hero-text">{heroContent.subtitle}</p>
                        </div>
                    </div>
                );
            }
            
            // Default simple variant
            return (
                <div className={theme.heroClassName}>
                    {heroContent.image && (
                        <Image 
                            src={heroContent.image} 
                            alt="Hero" 
                            width={heroContent.imageWidth || 280} 
                            height={heroContent.imageHeight || 280} 
                            quality={95}
                            className="theme-1-hero-image" 
                        />
                    )}
                    <div className="theme-1-hero-content">
                        <h1 className="theme-1-hero-title">{heroContent.title}</h1>
                        <p className="theme-1-hero-text">{heroContent.subtitle}</p>
                    </div>
                </div>
            );
        }

        if (theme.id === 'theme-2') {
            // Check if background variant is selected
            if (heroContent.variant === 'background') {
                return (
                    <div className={theme.heroClassName}>
                        {heroContent.backgroundImage && (
                            <Image 
                                src={heroContent.backgroundImage} 
                                alt="Background" 
                                width={1200} 
                                height={600} 
                                quality={95}
                                sizes="100vw"
                                className="theme-2-hero-bg-image" 
                            />
                        )}
                        <div className="theme-2-hero-content">
                            <h1 className="theme-2-hero-title">{heroContent.title}</h1>
                            <p className="theme-2-hero-text">{heroContent.subtitle}</p>
                        </div>
                    </div>
                );
            }
            
            // Default circles variant
            return (
                <div className={theme.heroClassName}>
                    {heroContent.circles && heroContent.circles.length > 0 && (
                        <div className="theme-2-hero-images-left">
                            {heroContent.circles.map((circle, idx) => (
                                <div key={idx} className={circle.className}>
                                    <Image 
                                        src={circle.src} 
                                        alt={`Child ${idx + 1}`} 
                                        width={220} 
                                        height={220} 
                                        quality={95}
                                        sizes="110px"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="theme-2-hero-content">
                        <h1 className="theme-2-hero-title">{heroContent.title}</h1>
                        <p className="theme-2-hero-text">{heroContent.subtitle}</p>
                        {heroContent.image && (
                            <Image 
                                src={heroContent.image} 
                                alt="Teddy" 
                                width={120} 
                                height={120} 
                                quality={95}
                                sizes="60px"
                                className="theme-2-hero-teddy" 
                                style={{ objectFit: 'contain' }} 
                            />
                        )}
                    </div>
                </div>
            );
        }

        if (theme.id === 'theme-3') {
            return (
                <div className={theme.heroClassName}>
                    {heroContent.backgroundImage && (
                        <Image 
                            src={heroContent.backgroundImage} 
                            alt="Pattern" 
                            width={400} 
                            height={300} 
                            className="theme-3-hero-bg-image" 
                        />
                    )}
                    <div className="theme-3-hero-content">
                        <h1 className="theme-3-hero-title">{heroContent.title}</h1>
                        {heroContent.subtitle.split('\n').map((line, idx) => (
                            <p key={idx} className="theme-3-hero-text">{line}</p>
                        ))}
                    </div>
                </div>
            );
        }

        return null;
    };

    const bestSellerSection = sections.find(s => s.type === 'best-seller');
    const productsSection = sections.find(s => s.type === 'products');

    // Use headerTextColor for cart icon if available, otherwise fall back to theme's cartStrokeColor
    const cartIconColor = customization?.headerTextColor || theme.cartStrokeColor || '#1f2937';

    return (
        <div className={theme.pageClassName} style={cssVariables}>
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

            {renderHero()}

            {bestSellerSection && (
                <section className={`${theme.sectionClassName} ${theme.id === 'theme-1' ? 'theme-1-best-seller-section' : ''}`}>
                    <SectionTitle title={bestSellerSection.title} className={`${theme.sectionTitleClassName} ${theme.id === 'theme-2' || theme.id === 'theme-3' ? 'theme-2-section-title-white' : ''}`} />
                    <ProductCarousel
                        products={bestSellerSection.products || products.slice(0, 3)}
                        baseHref={theme.baseRoute}
                        className={`${theme.id}-products-scroll`}
                        scrollContainerClassName={`${theme.id}-products-grid`}
                        buttonClassName={theme.scrollButtonClassName}
                        productCardProps={{
                            className: theme.productCardClassName,
                            imageClassName: theme.productImageClassName,
                            nameClassName: theme.productNameClassName,
                            priceClassName: theme.productPriceClassName,
                            ratingClassName: theme.productRatingClassName
                        }}
                    />
                </section>
            )}

            {categories.length > 0 && (
                <section className={theme.sectionClassName}>
                    <SectionTitle title="Categories" className={`${theme.sectionTitleClassName} ${theme.id === 'theme-2' || theme.id === 'theme-3' ? 'theme-2-section-title-white' : ''}`} />
                    <div className={`${theme.id}-categories`}>
                        {categories.map((category, idx) => (
                            <CategoryCard
                                key={idx}
                                image={category.image}
                                alt={category.alt}
                                label={category.label}
                                className={`${theme.categoryClassName} ${category.className || ''}`}
                                labelClassName={theme.categoryLabelClassName}
                                imageWidth={category.imageWidth}
                                imageHeight={category.imageHeight}
                            />
                        ))}
                    </div>
                </section>
            )}

            {productsSection && (
                <section className={`${theme.sectionClassName} ${theme.id === 'theme-2' ? 'theme-2-products-section' : ''}`}>
                    <SectionTitle title={productsSection.title} className={`${theme.sectionTitleClassName} ${theme.id === 'theme-2' || theme.id === 'theme-3' ? 'theme-2-section-title-white' : ''}`} />
                    <ProductGrid
                        products={productsSection.products || products}
                        baseHref={theme.baseRoute}
                        className={`${theme.id}-products-grid-full`}
                        productCardProps={{
                            className: theme.productCardClassName,
                            imageClassName: theme.productImageClassName,
                            nameClassName: theme.productNameClassName,
                            priceClassName: theme.productPriceClassName,
                            ratingClassName: theme.productRatingClassName
                        }}
                    />
                    {productsSection.showViewAll !== false && (
                        <button className={theme.viewAllClassName} onClick={() => router.push(`${theme.baseRoute}/all-products`)}>
                            View all
                        </button>
                    )}
                </section>
            )}
        </div>
    );
}

