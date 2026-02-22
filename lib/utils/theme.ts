import type { ThemeConfig } from '@/components/themes/themeConfig';
import { themeConfigs } from '@/components/themes/themeConfig';

/**
 * Extracts theme ID from a route path
 * @param pathname - The current pathname (e.g., "/store/theme-1/cart")
 * @returns Theme ID (e.g., "theme-1") or null if not found
 */
export function getThemeIdFromPath(pathname: string): string | null {
    const match = pathname.match(/\/store\/(theme-\d+)/);
    return match ? match[1] : null;
}

/**
 * Gets theme config from a route path
 * @param pathname - The current pathname
 * @returns ThemeConfig or null if not found
 */
export function getThemeFromPath(pathname: string): ThemeConfig | null {
    const themeId = getThemeIdFromPath(pathname);
    if (!themeId) return null;
    return themeConfigs[themeId] || null;
}

/**
 * Gets base route from theme ID
 * @param themeId - Theme ID (e.g., "theme-1")
 * @returns Base route (e.g., "/store/theme-1")
 */
export function getBaseRouteFromThemeId(themeId: string): string {
    return `/store/${themeId}`;
}

/**
 * Generates a unique gradient ID for a component based on theme and component name
 * @param themeId - Theme ID
 * @param componentName - Component name (e.g., "cart", "detail")
 * @returns Unique gradient ID
 */
export function getGradientId(themeId: string, componentName: string): string {
    const themeNum = themeId.replace('theme-', '');
    return `half-star-${componentName}${themeNum !== '1' ? `-${themeNum}` : ''}`;
}

