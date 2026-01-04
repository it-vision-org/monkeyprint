import { prisma } from "@/lib/prisma";
import { themeConfigs } from '@/components/themeConfig';
import { notFound } from "next/navigation";
import CartPageClient from "./CartPageClient";

export default async function CartPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const { storeSlug } = await params;
    
    const store = await prisma.store.findUnique({
        where: { slug: storeSlug },
        include: {
            themeCustomization: true
        }
    });

    if (!store) notFound();

    const themeId = (store.theme || 'theme-1') as keyof typeof themeConfigs;
    const theme = themeConfigs[themeId] || themeConfigs['theme-1'];
    
    const themeWithRoute = {
        ...theme,
        baseRoute: `/shop/${storeSlug}`
    };

    return <CartPageClient storeSlug={storeSlug} theme={themeWithRoute} />;
}

