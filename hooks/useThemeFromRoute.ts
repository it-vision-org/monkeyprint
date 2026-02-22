'use client';

import type { ThemeConfig } from '@/components/themes/themeConfig';
import { getGradientId, getThemeFromPath } from '@/lib/utils/theme';
import { usePathname } from 'next/navigation';

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

