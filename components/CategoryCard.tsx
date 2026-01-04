'use client';

import Image from 'next/image';

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
        <>
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
        </>
    );

    if (href) {
        return (
            <a href={href} className={className} onClick={onClick}>
                {content}
            </a>
        );
    }

    return (
        <div className={className} onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
            {content}
        </div>
    );
}

