'use client';

import { useState } from 'react';
import ProductCard from '../ui/ProductCard';
import ScrollButtons from '../ui/ScrollButtons';
import type { Product } from '../types';

type ProductCarouselProps = {
    products: Product[];
    baseHref: string;
    className?: string;
    scrollContainerClassName?: string;
    buttonsContainerClassName?: string;
    buttonClassName?: string;
    productCardProps?: {
        className?: string;
        imageClassName?: string;
        nameClassName?: string;
        priceClassName?: string;
        ratingClassName?: string;
    };
};

export default function ProductCarousel({
    products,
    baseHref,
    className = '',
    scrollContainerClassName = '',
    buttonsContainerClassName = '',
    buttonClassName = '',
    productCardProps = {}
}: ProductCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const visibleCount = 3;

    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => Math.min(products.length - visibleCount, prev + 1));
    };

    const visibleProducts = products.slice(currentIndex, currentIndex + visibleCount);

    return (
        <div className={className}>
            <div className={scrollContainerClassName}>
                {visibleProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        href={`${baseHref}/product/${product.id}`}
                        {...productCardProps}
                    />
                ))}
            </div>
            <ScrollButtons
                onPrev={handlePrev}
                onNext={handleNext}
                className={buttonsContainerClassName}
                buttonClassName={buttonClassName}
            />
        </div>
    );
}
