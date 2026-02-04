'use client';

import { useCart, CartItem } from "./CartContext";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import LoadingButton from "./LoadingButton";

export default function AddToCartButton({ product, frontUrl, storeName, storeSlug }: { product: any, frontUrl: string | null, storeName: string, storeSlug: string }) {
    const { addToCart } = useCart();
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [isBuying, setIsBuying] = useState(false);

    const handleAddToCart = async () => {
        setIsAdding(true);

        // Simulate a small delay for "alive" feel
        await new Promise(resolve => setTimeout(resolve, 600));

        addToCart({
            id: product.id,
            name: product.name,
            price: product.basePrice,
            image: frontUrl || undefined,
            quantity: 1,
            storeId: product.storeId,
            storeName: storeName,
            storeSlug: storeSlug
        });

        setIsAdding(false);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleBuyNow = async () => {
        setIsBuying(true);

        // Simulate logic
        addToCart({
            id: product.id,
            name: product.name,
            price: product.basePrice,
            image: frontUrl || undefined,
            quantity: 1,
            storeId: product.storeId,
            storeName: storeName,
            storeSlug: storeSlug
        });

        // We don't necessarily need a delay here as we're navigating
        router.push(`/shop/${storeSlug}/checkout`);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <LoadingButton
                onClick={handleAddToCart}
                isLoading={isAdding}
                isSuccess={isAdded}
                variant={isAdded ? 'success' : 'outline'}
                className="w-full"
                style={{ width: '100%' }}
            >
                {isAdded ? "Ajouté !" : "Ajouter au panier"}
            </LoadingButton>

            <LoadingButton
                onClick={handleBuyNow}
                isLoading={isBuying}
                variant="primary"
                className="w-full"
                style={{ width: '100%' }}
            >
                Commander maintenant
            </LoadingButton>
        </div>
    );
}
