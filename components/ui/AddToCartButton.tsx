'use client';

import { useCart } from "../providers/CartContext";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingButton from "./LoadingButton";

export default function AddToCartButton({ product, frontUrl, storeName, storeSlug }: { product: any, frontUrl: string | null, storeName: string, storeSlug: string }) {
    const { addToCart } = useCart();
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const lastActionAtRef = useRef(0);
    const MIN_ACTION_INTERVAL_MS = 700;

    const handleAddToCart = async () => {
        if (isAdding || isBuying) return;
        const now = Date.now();
        if (now - lastActionAtRef.current < MIN_ACTION_INTERVAL_MS) return;
        lastActionAtRef.current = now;
        setIsAdding(true);

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
        setFeedback("Produit ajouté au panier.");
        setTimeout(() => {
            setIsAdded(false);
            setFeedback(null);
        }, 1800);
    };

    const handleBuyNow = async () => {
        if (isBuying || isAdding) return;
        const now = Date.now();
        if (now - lastActionAtRef.current < MIN_ACTION_INTERVAL_MS) return;
        lastActionAtRef.current = now;
        setIsBuying(true);

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

        setFeedback("Redirection vers le paiement...");
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
                disabled={isBuying}
            >
                {isAdded ? "Ajouté !" : "Ajouter au panier"}
            </LoadingButton>

            <LoadingButton
                onClick={handleBuyNow}
                isLoading={isBuying}
                variant="primary"
                className="w-full"
                style={{ width: '100%' }}
                disabled={isAdding}
            >
                Commander maintenant
            </LoadingButton>
            {feedback && (
                <p style={{ margin: 0, fontSize: "13px", color: "#166534", textAlign: "center" }}>
                    {feedback}
                </p>
            )}
        </div>
    );
}
