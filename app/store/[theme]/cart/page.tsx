'use client';

import CartPage from '@/components/CartPage';
import { useThemeFromRoute } from '@/hooks/useThemeFromRoute';
import { DEFAULT_CART_ITEMS } from '@/lib/constants/mockData';

export default function CartPageRoute() {
    const { baseRoute, gradientId } = useThemeFromRoute();

    if (!baseRoute) {
        return <div>Theme not found</div>;
    }

    return (
        <CartPage 
            baseRoute={baseRoute} 
            initialItems={DEFAULT_CART_ITEMS} 
            gradientId={gradientId('cart')} 
        />
    );
}


