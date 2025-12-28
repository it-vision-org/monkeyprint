'use client';

import ProductDetailPage from '@/components/ProductDetailPage';
import { useThemeFromRoute } from '@/hooks/useThemeFromRoute';

export default function ProductDetailPageRoute() {
    const { baseRoute, gradientId } = useThemeFromRoute();

    if (!baseRoute) {
        return <div>Theme not found</div>;
    }

    return (
        <ProductDetailPage 
            baseRoute={baseRoute} 
            showTopHeader={true} 
            gradientId={gradientId('detail')} 
        />
    );
}

