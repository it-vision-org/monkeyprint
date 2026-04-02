import { prisma } from "@/lib/prisma";
import { getR2Url } from "@/lib/storage";
import { themeConfigs, AllProductsPage, type Product } from '@/components';
import { notFound } from "next/navigation";

export default async function StoreAllProductsPage({ params }: { params: Promise<{ storeSlug: string }> }) {
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
            }
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

    // Update theme baseRoute to use shop route with store slug
    const themeWithStoreRoute = {
        ...theme,
        baseRoute: `/shop/${store.slug}`
    };

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

    const themeDefaults: Record<string, { primary: string; heading: string }> = {
        'theme-1': { primary: '#1B6CA8', heading: '#1A1612' },
        'theme-2': { primary: '#C2724F', heading: '#2C1F14' },
        'theme-3': { primary: '#1A8A6E', heading: '#1A2B25' },
    };
    const defaults = themeDefaults[themeId] || themeDefaults['theme-1'];

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                    :root {
                        --theme-primary: ${defaults.primary};
                        --theme-heading: ${defaults.heading};
                    }
                `
            }} />
            <AllProductsPage
                theme={themeWithStoreRoute}
                products={productsWithImages}
            />
        </>
    );
}

