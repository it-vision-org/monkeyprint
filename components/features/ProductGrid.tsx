'use client';

import ProductCard from '../ui/ProductCard';
import type { Product } from '../types';

type ProductGridProps = {
    products: Product[];
    baseHref: string;
    className?: string;
    productCardProps?: {
        className?: string;
        imageClassName?: string;
        nameClassName?: string;
        priceClassName?: string;
        ratingClassName?: string;
        reviewsClassName?: string;
    };
};

export default function ProductGrid({
    products,
    baseHref,
    className = '',
    productCardProps = {}
}: ProductGridProps) {
    return (
        <div className={className}>
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    href={`${baseHref}/product/${product.id}`}
                    {...productCardProps}
                />
            ))}
        </div>
    );
}
