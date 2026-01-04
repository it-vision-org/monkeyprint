import { prisma } from "@/lib/prisma";
import { themeConfigs } from '@/components/themeConfig';
import { notFound } from "next/navigation";
import { getR2Url } from "@/lib/storage";
import { format } from "date-fns";
import OrderConfirmationClient from "./OrderConfirmationClient";

export default async function OrderConfirmationPage({
    params,
    searchParams,
}: {
    params: Promise<{ storeSlug: string }>;
    searchParams: Promise<{ orders?: string }>;
}) {
    const { storeSlug } = await params;
    const resolvedParams = await searchParams;
    const orderIds = resolvedParams.orders ? resolvedParams.orders.split(',') : [];

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

    const customization = store.themeCustomization;

    let orders: any[] = [];

    if (orderIds.length > 0) {
        // Filter orders to only show orders from this store
        orders = await prisma.order.findMany({
            where: { 
                id: { in: orderIds },
                storeId: store.id
            },
            include: {
                store: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Pre-load all images
        for (const order of orders) {
            for (const item of order.items) {
                if (item.product.previewFront) {
                    (item as any).imageUrl = await getR2Url(item.product.previewFront);
                }
            }
        }
    }

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
            <OrderConfirmationClient 
                storeSlug={storeSlug}
                theme={themeWithRoute}
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
                orders={orders}
            />
        </>
    );
}

