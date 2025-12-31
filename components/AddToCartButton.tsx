'use client';

import { useCart, CartItem } from "./CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ product, frontUrl, storeName, storeSlug }: { product: any, frontUrl: string | null, storeName: string, storeSlug: string }) {
    const { addToCart } = useCart();
    const router = useRouter();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.basePrice,
            image: frontUrl || undefined, // frontUrl is resolved string
            quantity: 1, // Default to 1
            storeId: product.storeId,
            storeName: storeName,
            storeSlug: storeSlug
        });
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        router.push('/checkout');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
                onClick={handleAddToCart}
                style={{
                    width: '100%',
                    padding: '16px',
                    background: isAdded ? '#41eb5c' : '#ffffff',
                    color: isAdded ? 'white' : '#000',
                    border: '2px solid #000',
                    borderColor: isAdded ? '#41eb5c' : '#000',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                {isAdded ? "Ajouté au panier !" : "Ajouter au panier"}
            </button>
            <button
                onClick={handleBuyNow}
                style={{
                    width: '100%',
                    padding: '16px',
                    background: '#000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                Commander maintenant
            </button>
        </div>
    );
}
