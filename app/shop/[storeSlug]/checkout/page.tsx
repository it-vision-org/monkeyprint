import { prisma } from "@/lib/prisma";
import { themeConfigs } from '@/components';
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
                        --theme-primary: ${customization?.primaryColor || defaults.primary};
                        --theme-heading: ${customization?.headingColor || defaults.heading};
                        ${customization?.secondaryColor ? `--theme-secondary: ${customization.secondaryColor};` : ''}
                        ${customization?.accentColor ? `--theme-accent: ${customization.accentColor};` : ''}
                        ${customization?.backgroundColor ? `--theme-bg: ${customization.backgroundColor};` : ''}
                        ${customization?.textColor ? `--theme-text: ${customization.textColor};` : ''}
                        ${customization?.headerBackgroundColor ? `--theme-header-bg: ${customization.headerBackgroundColor};` : ''}
                        ${customization?.headerTextColor ? `--theme-header-text: ${customization.headerTextColor};` : ''}
                        ${customization?.fontFamily ? `--theme-font: ${customization.fontFamily === 'system' ? 'system-ui, -apple-system' : customization.fontFamily};` : ''}
                        ${customization?.headingFontWeight ? `--theme-heading-weight: ${customization.headingFontWeight};` : ''}
                        ${customization?.bodyFontWeight ? `--theme-body-weight: ${customization.bodyFontWeight};` : ''}
                    }
                `
            }} />
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
