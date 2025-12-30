'use client';

import CheckoutPage from '@/components/CheckoutPage';
import { useThemeFromRoute } from '@/hooks/useThemeFromRoute';

export default function CheckoutPageRoute() {
    const { baseRoute } = useThemeFromRoute();

    if (!baseRoute) {
        return <div>Theme not found</div>;
    }

    return <CheckoutPage baseRoute={baseRoute} />;
}



