import { prisma } from "@/lib/prisma";
import { getR2Url } from "@/lib/storage";
import { ThemeStorePage, themeConfigs, type Product } from '@/components';
import { notFound } from "next/navigation";

export default async function StorePage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const { storeSlug } = await params;
    const store = await prisma.store.findUnique({
        where: { slug: storeSlug },
        include: {
            products: {
                where: {
                    previewFront: {
                        not: null
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            },
            themeCustomization: true
        }
    });

    if (!store) {
        notFound();
    }

    // Get theme from store - default to theme-1 if not set
    const themeId = store.theme || 'theme-1';
    const theme = themeConfigs[themeId];

    if (!theme) {
        notFound();
    }

    // Convert database products to Product type with R2 URLs
    const productsWithImages: Product[] = await Promise.all(
        store.products.map(async (product: typeof store.products[number]) => {
            let imageUrl: string | undefined;
            if (product.previewFront) {
                imageUrl = await getR2Url(product.previewFront);
            }
            return {
                id: product.id,
                name: product.name,
                price: `${product.basePrice}dt`,
                rating: 5, // Default rating since we don't have reviews yet
                reviews: 0, // Default reviews
                image: imageUrl
            };
        })
    );

    // Get customization or use defaults
    const customization = store.themeCustomization;

    // Resolve hero image URLs - prioritize customization, then store logo, then default hero images
    let customHeroImage: string | undefined;
    let customHeroBackground: string | undefined;

    // Default hero images for each theme
    const defaultHeroImages: Record<string, string> = {
        'theme-1': '/hero1.png',
        'theme-2': '/hero2.png',
        'theme-3': '/hero3.png'
    };

    // First check customization
    if (customization?.heroImageUrl) {
        // If it's already a full URL, use it directly; otherwise resolve it
        customHeroImage = customization.heroImageUrl.startsWith('http://') || customization.heroImageUrl.startsWith('https://')
            ? customization.heroImageUrl
            : await getR2Url(customization.heroImageUrl);
    } else if (store.logoUrl) {
        // Fallback to store logo if no custom hero image
        customHeroImage = store.logoUrl.startsWith('http://') || store.logoUrl.startsWith('https://')
            ? store.logoUrl
            : await getR2Url(store.logoUrl);
    } else {
        // Use default hero image for the theme
        customHeroImage = defaultHeroImages[themeId] || defaultHeroImages['theme-1'];
    }

    if (customization?.heroBackgroundUrl) {
        customHeroBackground = customization.heroBackgroundUrl.startsWith('http://') || customization.heroBackgroundUrl.startsWith('https://')
            ? customization.heroBackgroundUrl
            : await getR2Url(customization.heroBackgroundUrl);
    } else if (store.logoUrl) {
        // Fallback to store logo if no custom background
        customHeroBackground = store.logoUrl.startsWith('http://') || store.logoUrl.startsWith('https://')
            ? store.logoUrl
            : await getR2Url(store.logoUrl);
    } else {
        // Use default hero image for the theme
        customHeroBackground = defaultHeroImages[themeId] || defaultHeroImages['theme-1'];
    }

    // Create hero content from store data and customizations
    const heroVariant = (customization?.heroVariant as 'simple' | 'circles' | 'background') ||
        (themeId === 'theme-1' ? 'simple' : themeId === 'theme-2' ? 'circles' : 'background');

    let heroContent: {
        title: string;
        subtitle: string;
        image?: string;
        imageWidth?: number;
        imageHeight?: number;
        variant?: 'simple' | 'circles' | 'background';
        circles?: Array<{ src: string; className: string }>;
        backgroundImage?: string;
    };

    if (heroVariant === 'simple') {
        heroContent = {
            title: customization?.heroTitle || store.name || 'My Store',
            subtitle: customization?.heroSubtitle || `Explore the finest clothes chez ${store.name || 'our boutique'}`,
            image: customHeroImage,
            imageWidth: 280,
            imageHeight: 280,
            variant: 'simple'
        };
    } else if (heroVariant === 'circles') {
        // Ensure we always have a hero image for circles variant
        const heroImageForCircles = customHeroImage || defaultHeroImages[themeId] || defaultHeroImages['theme-1'];
        heroContent = {
            title: customization?.heroTitle || store.name || 'My Store',
            subtitle: customization?.heroSubtitle || `Explore the finest clothes for kids, chez ${store.name || 'us'}`,
            variant: 'circles',
            circles: heroImageForCircles ? [
                { src: heroImageForCircles, className: "theme-2-hero-image-circle theme-2-hero-img-1" },
                { src: heroImageForCircles, className: "theme-2-hero-image-circle theme-2-hero-img-2" },
                { src: heroImageForCircles, className: "theme-2-hero-image-circle theme-2-hero-img-3" }
            ] : undefined,
            image: heroImageForCircles
        };
    } else {
        // background variant
        heroContent = {
            title: customization?.heroTitle || store.name || 'My Store',
            subtitle: customization?.heroSubtitle || `Explore the finest clothes\nchez ${store.name || 'our boutique'}`,
            variant: 'background',
            backgroundImage: customHeroBackground
        };
    }

    // Get category images from customization or use defaults
    let categoryWomanImage = "/woman.png";
    let categoryManImage = "/man.png";
    let categoryKidsImage = "/kids.png";

    if (customization?.categoryWomanImageUrl) {
        // If it's already a full URL, use it directly; otherwise resolve it
        categoryWomanImage = customization.categoryWomanImageUrl.startsWith('http://') || customization.categoryWomanImageUrl.startsWith('https://')
            ? customization.categoryWomanImageUrl
            : await getR2Url(customization.categoryWomanImageUrl);
    }
    if (customization?.categoryManImageUrl) {
        categoryManImage = customization.categoryManImageUrl.startsWith('http://') || customization.categoryManImageUrl.startsWith('https://')
            ? customization.categoryManImageUrl
            : await getR2Url(customization.categoryManImageUrl);
    }
    if (customization?.categoryKidsImageUrl) {
        categoryKidsImage = customization.categoryKidsImageUrl.startsWith('http://') || customization.categoryKidsImageUrl.startsWith('https://')
            ? customization.categoryKidsImageUrl
            : await getR2Url(customization.categoryKidsImageUrl);
    }

    const categories = [
        { image: categoryWomanImage, alt: "Woman", label: "Woman", imageWidth: 400, imageHeight: 533 },
        { image: categoryManImage, alt: "Man", label: "Man", imageWidth: 400, imageHeight: 533 },
        { image: categoryKidsImage, alt: "Kids", label: "Kids", imageWidth: 400, imageHeight: 533 }
    ];

    // Create sections with real products
    const bestSellerProducts = productsWithImages.slice(0, 3);
    const allProducts = productsWithImages.slice(0, 6);

    const sections = [
        {
            title: customization?.bestSellerTitle || "Best Seller",
            type: 'best-seller' as const,
            products: bestSellerProducts.length > 0 ? bestSellerProducts : undefined
        },
        {
            title: customization?.productsTitle || "Products",
            type: 'products' as const,
            products: allProducts.length > 0 ? allProducts : undefined,
            showViewAll: true
        }
    ];

    // Update theme baseRoute to use shop route with store slug
    const themeWithStoreRoute = {
        ...theme,
        baseRoute: `/shop/${store.slug}`
    };

    return (
        <>
            {customization && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                        :root {
                            ${customization.primaryColor ? `--theme-primary: ${customization.primaryColor};` : ''}
                            ${customization.secondaryColor ? `--theme-secondary: ${customization.secondaryColor};` : ''}
                            ${customization.accentColor ? `--theme-accent: ${customization.accentColor};` : ''}
                            ${customization.backgroundColor ? `--theme-bg: ${customization.backgroundColor};` : ''}
                            ${customization.textColor ? `--theme-text: ${customization.textColor};` : ''}
                            ${customization.headingColor ? `--theme-heading: ${customization.headingColor};` : ''}
                            ${customization.headerBackgroundColor ? `--theme-header-bg: ${customization.headerBackgroundColor};` : ''}
                            ${customization.headerTextColor ? `--theme-header-text: ${customization.headerTextColor};` : ''}
                            ${customization.fontFamily ? `--theme-font: ${customization.fontFamily === 'system' ? 'system-ui, -apple-system' : customization.fontFamily};` : ''}
                            ${customization.headingFontWeight ? `--theme-heading-weight: ${customization.headingFontWeight};` : ''}
                            ${customization.bodyFontWeight ? `--theme-body-weight: ${customization.bodyFontWeight};` : ''}
                        }
                    `
                }} />
            )}
            <ThemeStorePage
                theme={themeWithStoreRoute}
                products={productsWithImages}
                heroContent={heroContent}
                categories={categories}
                sections={sections}
                storeSlug={store.slug}
                customization={customization ? {
                    primaryColor: customization.primaryColor,
                    secondaryColor: customization.secondaryColor,
                    accentColor: customization.accentColor,
                    backgroundColor: customization.backgroundColor,
                    textColor: customization.textColor,
                    headingColor: customization.headingColor,
                    headerBackgroundColor: customization.headerBackgroundColor,
                    headerTextColor: customization.headerTextColor,
                    fontFamily: customization.fontFamily,
                    headingFontWeight: customization.headingFontWeight,
                    bodyFontWeight: customization.bodyFontWeight,
                } : undefined}
            />
        </>
    );
}

