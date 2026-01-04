import { prisma } from "@/lib/prisma";
import { themeConfigs } from '@/components/themeConfig';
import { notFound } from "next/navigation";
import CheckoutPageClient from "./CheckoutPageClient";

export default async function CheckoutPage({ params }: { params: Promise<{ storeSlug: string }> }) {
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

    const customization = store.themeCustomization;

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
            <CheckoutPageClient 
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
            />
        </>
    );
}
