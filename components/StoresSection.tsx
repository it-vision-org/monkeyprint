'use client';

import Image from "next/image";
import Link from "next/link";

type Store = {
    href: string;
    image: string;
    imageWidth?: number;
    imageHeight?: number;
    alt?: string;
};

type StoresSectionProps = {
    title?: string;
    subtitle?: string;
    titleClassName?: string;
    subtitleClassName?: string;
    stores: Store[];
    getStoreBoxClassName: (index: number) => string;
    showArrows?: boolean;
    getArrowClassName: (index: number) => string;
    arrowStrokeClassName?: string;
};

export default function StoresSection({
    title = "Découvrez les boutiques",
    subtitle = "Voici quelques-uns des magasins les plus populaires",
    titleClassName = '',
    subtitleClassName = '',
    stores,
    getStoreBoxClassName,
    showArrows = false,
    getArrowClassName,
    arrowStrokeClassName = ''
}: StoresSectionProps) {
    return (
        <>
            <div id="stores" className={titleClassName}>
                {title}
            </div>
            <div className={subtitleClassName}>{subtitle}</div>
            {stores.map((store, index) => (
                <Link 
                    key={index}
                    href={store.href} 
                    className={getStoreBoxClassName(index)}
                    aria-label={`Theme ${index + 1} preview`}
                >
                    <Image 
                        src={store.image} 
                        alt={store.alt || `Theme ${index + 1}`} 
                        width={store.imageWidth || 117} 
                        height={store.imageHeight || 117} 
                    />
                </Link>
            ))}
            {showArrows && stores.map((_, index) => (
                <div 
                    key={`arrow-${index}`}
                    className={getArrowClassName(index)}
                    aria-hidden="true"
                >
                    <span className={arrowStrokeClassName} />
                </div>
            ))}
        </>
    );
}

