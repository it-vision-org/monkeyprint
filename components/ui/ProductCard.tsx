'use client';

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import LoadingLink from './LoadingLink';
import StarRating from './StarRating';
import type { Product } from '../types';
import { productCardVariants } from '@/lib/interactions';

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
    infoClassName?: string;
    customVariants?: Variants;
    disableAnimation?: boolean;
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
    reviewsClassName = '',
    infoClassName = '',
    customVariants,
    disableAnimation = false
}: ProductCardProps) {
    const imageSource = imageSrc || product.image || '/mock-shirt.png';

    // Auto-generate reviews class from rating class if not provided
    const finalReviewsClassName = reviewsClassName || (ratingClassName ? `${ratingClassName}-reviews` : '');

    return (
        <LoadingLink href={href} className={className} style={{ display: 'block', textDecoration: 'none' }} showSpinner={false}>
            <motion.div
                variants={disableAnimation ? undefined : (customVariants || productCardVariants)}
                initial={disableAnimation ? undefined : "idle"}
                whileHover={disableAnimation ? undefined : "hover"}
                whileTap={disableAnimation ? undefined : "tap"}
                style={{ cursor: 'pointer', height: '100%' }}
            >
                <div className={imageClassName}>
                    <Image
                        src={imageSource}
                        alt={product.name}
                        width={100}
                        height={100}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
                <div className={infoClassName}>
                    <div style={{ flex: 1 }}>
                        <h3 className={nameClassName}>{product.name}</h3>
                        <p className={priceClassName}>{product.price}</p>
                    </div>
                    <StarRating
                        rating={product.rating}
                        reviews={product.reviews}
                        className={ratingClassName}
                        reviewsClassName={finalReviewsClassName}
                    />
                </div>
            </motion.div>
        </LoadingLink>
    );
}
