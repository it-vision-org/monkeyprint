import { prisma } from '@/lib/prisma';
import { getR2Url } from '@/lib/storage';
import { ThemeStorePage, themeConfigs, type Product } from '@/components';
import { notFound } from 'next/navigation';

export default async function ThemePage({ params }: { params: Promise<{ theme: string }> }) {
    const { theme: themeId } = await params;
    const theme = themeConfigs[themeId];

    if (!theme) {
        notFound();
    }

    // Fetch stores with this theme that have products
    const stores = await prisma.store.findMany({
        where: {
            theme: themeId,
            status: 'ACTIVE',
            products: {
                some: {
                    previewFront: {
                        not: null
                    }
                }
            }
        },
        include: {
            products: {
                where: {
                    previewFront: {
                        not: null
                    }
                },
                take: 20,
                orderBy: {
                    createdAt: 'desc'
                }
            },
            themeCustomization: true
        },
        take: 1,
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Get the first store with products
    const store = stores.find((s: typeof stores[number]) => s.products.length > 0) || stores[0];

    // Convert database products to Product type with R2 URLs
    const productsWithImages: Product[] = store?.products ? await Promise.all(
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
    ) : [];

    // Get customization or use defaults
    const customization = store?.themeCustomization;

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
    } else if (store?.logoUrl) {
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
    } else if (store?.logoUrl) {
        // Fallback to store logo if no custom background
        customHeroBackground = store.logoUrl.startsWith('http://') || store.logoUrl.startsWith('https://')
            ? store.logoUrl
            : await getR2Url(store.logoUrl);
    } else {
        // Use default hero image for the theme
        customHeroBackground = defaultHeroImages[themeId] || defaultHeroImages['theme-1'];
    }

    // Create hero content from store data based on theme
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
            title: customization?.heroTitle || store?.name || 'Boutique',
            subtitle: customization?.heroSubtitle || `Explore the finest clothes chez ${store?.name || 'notre boutique'}`,
            image: customHeroImage,
            imageWidth: 280,
            imageHeight: 280,
            variant: 'simple'
        };
    } else if (heroVariant === 'circles') {
        // Ensure we always have a hero image for circles variant
        const heroImageForCircles = customHeroImage || defaultHeroImages[themeId] || defaultHeroImages['theme-1'];
        heroContent = {
            title: customization?.heroTitle || store?.name || 'Boutique',
            subtitle: customization?.heroSubtitle || `Explore the finest clothes for kids, chez ${store?.name || 'notre boutique'}`,
            variant: 'circles',
            circles: heroImageForCircles ? [
                { src: heroImageForCircles, className: "theme-2-hero-image-circle theme-2-hero-img-1" },
                { src: heroImageForCircles, className: "theme-2-hero-image-circle theme-2-hero-img-2" },
                { src: heroImageForCircles, className: "theme-2-hero-image-circle theme-2-hero-img-3" }
            ] : undefined,
            image: heroImageForCircles
        };
    } else {
        // theme-3 background variant
        heroContent = {
            title: customization?.heroTitle || store?.name || 'Boutique',
            subtitle: customization?.heroSubtitle || `Explore the finest clothes\nchez ${store?.name || 'notre boutique'}`,
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
            title: "Best Seller",
            type: 'best-seller' as const,
            products: bestSellerProducts.length > 0 ? bestSellerProducts : undefined
        },
        {
            title: "Products",
            type: 'products' as const,
            products: allProducts.length > 0 ? allProducts : undefined,
            showViewAll: true
        }
    ];

    return (
        <ThemeStorePage
            theme={theme}
            products={productsWithImages}
            heroContent={heroContent}
            categories={categories}
            sections={sections}
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
    );
}

