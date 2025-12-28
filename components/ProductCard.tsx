'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import StarRating from './StarRating';
import type { Product } from './types';

type ProductCardProps = {
    product: Product;
    href: string;
    imageSrc?: string;
    className?: string;
    imageClassName?: string;
    nameClassName?: string;
    priceClassName?: string;
    ratingClassName?: string;
    reviewsClassName?: string;
};

export default function ProductCard({
    product,
    href,
    imageSrc,
    className = '',
    imageClassName = '',
    nameClassName = '',
    priceClassName = '',
    ratingClassName = '',
    reviewsClassName = ''
}: ProductCardProps) {
    const router = useRouter();
    const imageSource = imageSrc || product.image || '/mock-shirt.png';
    
    // Auto-generate reviews class from rating class if not provided
    const finalReviewsClassName = reviewsClassName || (ratingClassName ? `${ratingClassName}-reviews` : '');

    return (
        <div 
            className={className}
            onClick={() => router.push(href)}
            style={{ cursor: 'pointer' }}
        >
            <div className={imageClassName}>
                <Image 
                    src={imageSource} 
                    alt={product.name} 
                    width={100} 
                    height={100} 
                    style={{ objectFit: 'contain' }} 
                />
            </div>
            <h3 className={nameClassName}>{product.name}</h3>
            <p className={priceClassName}>{product.price}</p>
            <StarRating 
                rating={product.rating} 
                reviews={product.reviews}
                className={ratingClassName}
                reviewsClassName={finalReviewsClassName}
            />
        </div>
    );
}

