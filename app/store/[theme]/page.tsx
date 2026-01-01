import { prisma } from '@/lib/prisma';
import { getR2Url } from '@/lib/storage';
import ThemeStorePage from '@/components/ThemeStorePage';
import { themeConfigs } from '@/components/themeConfig';
import type { Product } from '@/components/types';
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
            }
        },
        take: 1,
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Get the first store with products
    const store = stores.find(s => s.products.length > 0) || stores[0];

    // Convert database products to Product type with R2 URLs
    const productsWithImages: Product[] = store?.products ? await Promise.all(
        store.products.map(async (product) => {
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

    // Get store logo URL for hero
    let heroImage = "/T-Shirt.png";
    if (store?.logoUrl) {
        heroImage = await getR2Url(store.logoUrl);
    }

    // Create hero content from store data based on theme
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

    if (themeId === 'theme-1') {
        heroContent = {
            title: store?.name || 'Boutique',
            subtitle: `Explore the finest clothes chez ${store?.name || 'notre boutique'}`,
            image: heroImage,
            imageWidth: 280,
            imageHeight: 280,
            variant: 'simple'
        };
    } else if (themeId === 'theme-2') {
        heroContent = {
            title: store?.name || 'Boutique',
            subtitle: `Explore the finest clothes for kids, chez ${store?.name || 'notre boutique'}`,
            variant: 'circles',
            circles: [
                { src: heroImage, className: "theme-2-hero-image-circle theme-2-hero-img-1" },
                { src: heroImage, className: "theme-2-hero-image-circle theme-2-hero-img-2" },
                { src: heroImage, className: "theme-2-hero-image-circle theme-2-hero-img-3" }
            ],
            image: heroImage
        };
    } else {
        // theme-3
        heroContent = {
            title: store?.name || 'Boutique',
            subtitle: `Explore the finest clothes\nchez ${store?.name || 'notre boutique'}`,
            variant: 'background',
            backgroundImage: heroImage
        };
    }

    // Use default categories for now (can be enhanced later)
    const categories = [
        { image: "/Hoodie.png", alt: "Woman", label: "Woman", imageWidth: 120, imageHeight: 160 },
        { image: "/Hoodie.png", alt: "Man", label: "Man", imageWidth: 120, imageHeight: 160 },
        { image: "/Hoodie.png", alt: "Kids", label: "Kids", imageWidth: 120, imageHeight: 160 }
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
        />
    );
}

