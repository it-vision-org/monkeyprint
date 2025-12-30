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
            title: "GrabMeShoe",
            subtitle: "Explore the finest clothes chez GrabMeShoe",
            image: "/T-Shirt.png",
            imageWidth: 280,
            imageHeight: 280,
            variant: 'simple'
        },
        categories: [
            { image: "/Hoodie.png", alt: "Woman", label: "Woman", imageWidth: 120, imageHeight: 160 },
            { image: "/Hoodie.png", alt: "Man", label: "Man", imageWidth: 120, imageHeight: 160 },
            { image: "/Hoodie.png", alt: "Kids", label: "Kids", imageWidth: 120, imageHeight: 160 }
        ],
        sections: [
            { title: "Best Seller", type: 'best-seller', products: Array(3).fill({
                name: "T-Shirt Circles",
                price: "50dt",
                rating: 5,
                reviews: 131
            }).map((p, idx) => ({ ...p, id: idx })) },
            { title: "Products", type: 'products', products: Array(6).fill({
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
            title: "GrabMeShoe",
            subtitle: "Explore the finest clothes for kids, chez GrabMeShoe",
            variant: 'circles',
            circles: [
                { src: "/T-Shirt-Design.png", className: "theme-2-hero-image-circle theme-2-hero-img-1" },
                { src: "/T-Shirt-Design.png", className: "theme-2-hero-image-circle theme-2-hero-img-2" },
                { src: "/T-Shirt-Design.png", className: "theme-2-hero-image-circle theme-2-hero-img-3" }
            ],
            image: "/T-Shirt-Design.png"
        },
        categories: [
            { image: "/T-Shirt-Design.png", alt: "Girl", label: "Girl", imageWidth: 200, imageHeight: 280, className: "theme-2-cat-yellow" },
            { image: "/T-Shirt-Design.png", alt: "Boy", label: "Boy", imageWidth: 200, imageHeight: 280, className: "theme-2-cat-blue" }
        ],
        sections: [
            { title: "Best Seller", type: 'best-seller', products: Array(3).fill({
                name: "T-Shirt Circles",
                price: "50dt",
                rating: 4,
                reviews: 130
            }).map((p, idx) => ({ ...p, id: idx })) },
            { title: "Products", type: 'products', products: Array(6).fill({
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
            title: "GrabMeShoe",
            subtitle: "Explore the finest clothes\nchez GrabMeShoe",
            variant: 'background',
            backgroundImage: "/T-Shirt-Design.png"
        },
        categories: [
            { image: "/T-Shirt-Design.png", alt: "Woman", label: "Woman", imageWidth: 140, imageHeight: 220 },
            { image: "/T-Shirt-Design.png", alt: "Man", label: "Man", imageWidth: 140, imageHeight: 220 },
            { image: "/T-Shirt-Design.png", alt: "Kids", label: "Kids", imageWidth: 140, imageHeight: 220 }
        ],
        sections: [
            { title: "Best Seller", type: 'best-seller', products: Array(3).fill({
                name: "T-Shirt Circles",
                price: "50dt",
                rating: 5,
                reviews: 131
            }).map((p, idx) => ({ ...p, id: idx })) },
            { title: "Products", type: 'products', products: Array(6).fill({
                name: "T-Shirt Circles",
                price: "50dt",
                rating: 5,
                reviews: 131
            }).map((p, idx) => ({ ...p, id: idx })), showViewAll: true }
        ]
    }
};




