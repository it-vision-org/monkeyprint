import type { Product } from '@/components/types';

export type ThemeHeroContent = {
    title: string;
    subtitle: string;
    image?: string;
    imageWidth?: number;
    imageHeight?: number;
    variant?: 'simple' | 'circles' | 'background';
    circles?: Array<{ src: string; className: string }>;
    backgroundImage?: string;
};

export type ThemeCategory = {
    image: string;
    alt: string;
    label: string;
    imageWidth: number;
    imageHeight: number;
    className?: string;
};

export type ThemeHomePageData = {
    products: Product[];
    heroContent: ThemeHeroContent;
    categories: ThemeCategory[];
    sections: Array<{
        title: string;
        type: 'best-seller' | 'products';
        products?: Product[];
        showViewAll?: boolean;
    }>;
};

export const themeHomePageData: Record<string, ThemeHomePageData> = {
    'theme-1': {
        products: Array(6).fill({
            name: "T-Shirt Circles",
            price: "50dt",
            rating: 5,
            reviews: 131
        }).map((p, idx) => ({ ...p, id: idx })),
        heroContent: {
            title: "Boutique",
            subtitle: "Découvrez les meilleurs vêtements de notre boutique",
            image: "/hero1.png",
            imageWidth: 280,
            imageHeight: 280,
            variant: 'simple'
        },
        categories: [
            { image: "/woman.png", alt: "Femme", label: "Femme", imageWidth: 400, imageHeight: 533 },
            { image: "/man.png", alt: "Homme", label: "Homme", imageWidth: 400, imageHeight: 533 },
            { image: "/kids.png", alt: "Enfants", label: "Enfants", imageWidth: 400, imageHeight: 533 }
        ],
        sections: [
            { title: "Meilleures ventes", type: 'best-seller', products: Array(3).fill({
                name: "T-Shirt Circles",
                price: "50dt",
                rating: 5,
                reviews: 131
            }).map((p, idx) => ({ ...p, id: idx })) },
            { title: "Produits", type: 'products', products: Array(6).fill({
                name: "T-Shirt Circles",
                price: "50dt",
                rating: 5,
                reviews: 131
            }).map((p, idx) => ({ ...p, id: idx })), showViewAll: true }
        ]
    },
    'theme-2': {
        products: Array(6).fill({
            name: "T-Shirt Circles",
            price: "50dt",
            rating: 4,
            reviews: 130
        }).map((p, idx) => ({ ...p, id: idx })),
        heroContent: {
            title: "Boutique",
            subtitle: "Découvrez les meilleurs vêtements pour enfants, chez notre boutique",
            variant: 'circles',
            circles: [
                { src: "/hero2.png", className: "theme-2-hero-image-circle theme-2-hero-img-1" },
                { src: "/hero2.png", className: "theme-2-hero-image-circle theme-2-hero-img-2" },
                { src: "/hero2.png", className: "theme-2-hero-image-circle theme-2-hero-img-3" }
            ],
            image: "/hero2.png"
        },
        categories: [
            { image: "/T-Shirt-Design.png", alt: "Fille", label: "Fille", imageWidth: 200, imageHeight: 280, className: "theme-2-cat-yellow" },
            { image: "/T-Shirt-Design.png", alt: "Garçon", label: "Garçon", imageWidth: 200, imageHeight: 280, className: "theme-2-cat-blue" }
        ],
        sections: [
            { title: "Meilleures ventes", type: 'best-seller', products: Array(3).fill({
                name: "T-Shirt Circles",
                price: "50dt",
                rating: 4,
                reviews: 130
            }).map((p, idx) => ({ ...p, id: idx })) },
            { title: "Produits", type: 'products', products: Array(6).fill({
                name: "T-Shirt Circles",
                price: "50dt",
                rating: 4,
                reviews: 130
            }).map((p, idx) => ({ ...p, id: idx })), showViewAll: true }
        ]
    },
    'theme-3': {
        products: Array(6).fill({
            name: "T-Shirt Circles",
            price: "50dt",
            rating: 5,
            reviews: 131
        }).map((p, idx) => ({ ...p, id: idx })),
        heroContent: {
            title: "Boutique",
            subtitle: "Découvrez les meilleurs vêtements\nchez notre boutique",
            variant: 'background',
            backgroundImage: "/hero3.png"
        },
        categories: [
            { image: "/T-Shirt-Design.png", alt: "Femme", label: "Femme", imageWidth: 140, imageHeight: 220 },
            { image: "/T-Shirt-Design.png", alt: "Homme", label: "Homme", imageWidth: 140, imageHeight: 220 },
            { image: "/T-Shirt-Design.png", alt: "Enfants", label: "Enfants", imageWidth: 140, imageHeight: 220 }
        ],
        sections: [
            { title: "Meilleures ventes", type: 'best-seller', products: Array(3).fill({
                name: "T-Shirt Circles",
                price: "50dt",
                rating: 5,
                reviews: 131
            }).map((p, idx) => ({ ...p, id: idx })) },
            { title: "Produits", type: 'products', products: Array(6).fill({
                name: "T-Shirt Circles",
                price: "50dt",
                rating: 5,
                reviews: 131
            }).map((p, idx) => ({ ...p, id: idx })), showViewAll: true }
        ]
    }
};







