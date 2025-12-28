'use client';

import { usePathname } from 'next/navigation';
import { getThemeFromPath, getGradientId } from '@/lib/utils/theme';
import { themeConfigs } from '@/components/themeConfig';
import type { ThemeConfig } from '@/components/themeConfig';

/**
 * Hook to get theme configuration from current route
 */
export function useThemeFromRoute(): {
    theme: ThemeConfig | null;
    themeId: string | null;
    baseRoute: string | null;
    gradientId: (componentName: string) => string;
} {
    const pathname = usePathname();
    const theme = getThemeFromPath(pathname);
    const themeId = theme?.id || null;
    const baseRoute = theme?.baseRoute || null;

    const getGradientIdForComponent = (componentName: string): string => {
        if (!themeId) return `half-star-${componentName}`;
        return getGradientId(themeId, componentName);
    };

    return {
        theme,
        themeId,
        baseRoute,
        gradientId: getGradientIdForComponent
    };
}

