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
};

export default function ThemeStorePage({
    theme,
    products,
    heroContent,
    categories,
    sections = []
}: ThemeStorePageProps) {
    const router = useRouter();
    const [cartCount] = useState(1);

    const renderHero = () => {
        if (theme.id === 'theme-1') {
            return (
                <div className={theme.heroClassName}>
                    <Image 
                        src={heroContent.image || "/T-Shirt.png"} 
                        alt="Shirt" 
                        width={heroContent.imageWidth || 280} 
                        height={heroContent.imageHeight || 280} 
                        className="theme-1-hero-image" 
                    />
                    <div className="theme-1-hero-content">
                        <h1 className="theme-1-hero-title">{heroContent.title}</h1>
                        <p className="theme-1-hero-text">{heroContent.subtitle}</p>
                    </div>
                </div>
            );
        }

        if (theme.id === 'theme-2') {
            return (
                <div className={theme.heroClassName}>
                    {heroContent.circles && (
                        <div className="theme-2-hero-images-left">
                            {heroContent.circles.map((circle, idx) => (
                                <div key={idx} className={circle.className}>
                                    <Image 
                                        src={circle.src} 
                                        alt={`Child ${idx + 1}`} 
                                        width={100} 
                                        height={100} 
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
                                width={60} 
                                height={60} 
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

    return (
        <div className={theme.pageClassName}>
            <StoreHeader
                cartCount={cartCount}
                cartHref={`${theme.baseRoute}/cart`}
                logoFilter={theme.logoFilter}
                className={theme.headerClassName}
                containerClassName={theme.containerClassName}
                cartButtonClassName={theme.cartButtonClassName}
                cartBadgeClassName={theme.cartBadgeClassName}
                cartStrokeColor={theme.cartStrokeColor}
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

