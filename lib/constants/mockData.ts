import type { Product } from '@/components/types';
import type { CartItem } from '@/components/CartPage';

/**
 * Default mock products for testing
 */
export const DEFAULT_PRODUCTS: Product[] = Array(6).fill({
    name: "T-Shirt Circles",
    price: "50dt",
    rating: 5,
    reviews: 131
}).map((p, idx) => ({ ...p, id: idx }));

/**
 * Default mock cart items
 */
export const DEFAULT_CART_ITEMS: CartItem[] = [
    { 
        id: 1, 
        name: "T-Shirt Circles", 
        price: 50, 
        sizes: [
            { size: 'L', quantity: 10 },
            { size: 'S', quantity: 22 },
            { size: 'M', quantity: 5 }
        ]
    },
    { 
        id: 2, 
        name: "T-Shirt Circles", 
        price: 50, 
        sizes: [
            { size: 'S', quantity: 1 }
        ]
    }
];

/**
 * Default product detail data
 */
export const DEFAULT_PRODUCT_DETAIL = {
    name: "T-Shirt Circles",
    price: "50dt",
    rating: 4.5,
    reviews: 131,
    description: "This is a tshirt you can wear, and you can clean and enjoy high quality fabric"
};

/**
 * Default sizes
 */
export const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

/**
 * Default colors
 */
export const DEFAULT_COLORS = ['#000000', '#0000FF', '#FF0000', '#FFFFFF', '#00FF00'];

/**
 * Default checkout order items
 */
export const DEFAULT_CHECKOUT_ITEMS = [
    { name: 'T-Shirt Circles', price: '50dt', size: 'L', quantity: 10 },
    { name: 'T-Shirt Circles', price: '50dt', size: 'M', quantity: 10 }
];

/**
 * Tunisian cities for checkout form
 */
export const TUNISIAN_CITIES = [
    'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 
    'Gafsa', 'Monastir', 'Ben Arous', 'Kasserine', 'Médenine', 'Nabeul',
    'Tataouine', 'Béja', 'Jendouba', 'Mahdia', 'Sidi Bouzid', 'Siliana',
    'Kébili', 'Tozeur', 'Manouba', 'Zaghouan', 'La Marsa', 'Hammamet'
];

