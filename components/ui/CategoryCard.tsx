'use client';

import Image from 'next/image';
import LoadingLink from './LoadingLink';
import { motion } from 'framer-motion';
import { cardVariants } from '@/lib/interactions';

type CategoryCardProps = {
    image: string;
    alt: string;
    label: string;
    href?: string;
    onClick?: () => void;
    className?: string;
    imageClassName?: string;
    labelClassName?: string;
    imageWidth?: number;
    imageHeight?: number;
};

export default function CategoryCard({
    image,
    alt,
    label,
    href,
    onClick,
    className = '',
    imageClassName = '',
    labelClassName = '',
    imageWidth = 120,
    imageHeight = 160
}: CategoryCardProps) {
    const content = (
        <motion.div
            variants={cardVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            className={className}
            style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 'inherit'
            }}
            onClick={onClick}
        >
            <Image
                src={image}
                alt={alt}
                width={imageWidth}
                height={imageHeight}
                quality={95}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                className={imageClassName}
            />
            <span className={labelClassName}>{label}</span>
        </motion.div>
    );

    if (href) {
        return (
            <LoadingLink href={href} className={className} style={{ display: 'block', textDecoration: 'none' }} showSpinner={false}>
                {content}
            </LoadingLink>
        );
    }

    return content;
}
