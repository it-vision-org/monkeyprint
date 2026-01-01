export type Product = {
    id: string | number;
    name: string;
    price: string;
    rating: number;
    reviews: number;
    image?: string;
};

export type CartItem = {
    label: string;
    price: number;
    icon?: React.ReactNode;
};

export type MenuItem = {
    label: string;
    href: string;
    icon?: string;
    onClick?: () => void;
};

