'use client';

import AllProductsPage from '@/components/AllProductsPage';
import { useThemeFromRoute } from '@/hooks/useThemeFromRoute';

export default function AllProductsPageRoute() {
    const { theme } = useThemeFromRoute();

    if (!theme) {
        return <div>Theme not found</div>;
    }

    return <AllProductsPage theme={theme} />;
}



