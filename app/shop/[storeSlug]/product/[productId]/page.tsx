import { prisma } from "@/lib/prisma";
import { getR2Url } from "@/lib/storage";
import { notFound } from "next/navigation";
import { themeConfigs } from '@/components';
import ProductPageClient from "./ProductPageClient";

export default async function ProductPage({ params }: { params: Promise<{ storeSlug: string, productId: string }> }) {
    const { storeSlug, productId } = await params;
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            store: {
                include: {
                    themeCustomization: true
                }
            }
        }
    });

    if (!product || !product.store) notFound();

    const frontUrl = product.previewFront ? await getR2Url(product.previewFront) : null;
    const backUrl = product.previewBack ? await getR2Url(product.previewBack) : null;

    const themeId = (product.store.theme || 'theme-1') as keyof typeof themeConfigs;
    const theme = themeConfigs[themeId] || themeConfigs['theme-1'];

    // Update baseRoute to use shop route
    const themeWithRoute = {
        ...theme,
        baseRoute: `/shop/${storeSlug}`
    };

    const customization = product.store.themeCustomization;

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
            <ProductPageClient
                product={product}
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
                frontUrl={frontUrl}
                backUrl={backUrl}
            />
        </>
    );
}
