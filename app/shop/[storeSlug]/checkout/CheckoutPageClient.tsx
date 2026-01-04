'use client';

import { useCart } from "@/components/CartContext";
import { useState } from "react";
import { placeOrder } from "@/app/checkout/actions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAlert } from '@/components/AlertContext';
import Link from "next/link";
import StoreHeader from "@/components/StoreHeader";
import type { ThemeConfig } from '@/components/themeConfig';

export default function CheckoutPageClient({ storeSlug, theme }: { storeSlug: string; theme: ThemeConfig }) {
    const router = useRouter();
    const { items: allItems, updateQuantity, removeFromCart } = useCart();
    const { showAlert } = useAlert();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter items by store
    const items = allItems.filter(item => item.storeSlug === storeSlug);
    const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        formData.append('items', JSON.stringify(items));

        try {
            const result = await placeOrder(formData);
            if (result && result.error) {
                showAlert(result.error, 'error');
                setIsSubmitting(false);
            } else if (result && result.success) {
                // Remove only items from this store
                items.forEach(item => removeFromCart(item.id));
                router.push(`/order-confirmation?orders=${result.orderIds.join(',')}`);
            }
        } catch (e) {
            console.error(e);
            showAlert("Une erreur inattendue est survenue.", 'error');
            setIsSubmitting(false);
        }
    };

    const shippingCost = 7;
    const total = cartTotal + shippingCost;

    const getPageClassName = () => {
        const baseClass = 'checkout-page-modern';
        if (theme.id === 'theme-2') return `${baseClass} checkout-theme-2`;
        if (theme.id === 'theme-3') return `${baseClass} checkout-theme-3`;
        return `${baseClass} checkout-theme-1`;
    };

    if (items.length === 0) {
        return (
            <div className={getPageClassName()}>
                <StoreHeader
                    cartCount={items.length}
                    cartHref={`${theme.baseRoute}/cart`}
                    logoFilter={theme.logoFilter}
                    className={theme.headerClassName}
                    containerClassName={theme.containerClassName}
                    cartButtonClassName={theme.cartButtonClassName}
                    cartBadgeClassName={theme.cartBadgeClassName}
                    cartStrokeColor={theme.cartStrokeColor}
                />
                <div className="checkout-empty-modern">
                    <div className="checkout-empty-content-modern">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <path d="M20 7H4M20 7L18 5M20 7L18 9M4 7L6 5M4 7L6 9M6 5L5 3H19L18 5M6 9L7 21H17L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <h1>Your cart is empty</h1>
                        <p>Start shopping to add items to your cart</p>
                        <Link href={theme.baseRoute} className="checkout-empty-btn-modern">
                            Back to Store
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={getPageClassName()}>
            <StoreHeader
                cartCount={items.length}
                cartHref={`${theme.baseRoute}/cart`}
                logoFilter={theme.logoFilter}
                className={theme.headerClassName}
                containerClassName={theme.containerClassName}
                cartButtonClassName={theme.cartButtonClassName}
                cartBadgeClassName={theme.cartBadgeClassName}
                cartStrokeColor={theme.cartStrokeColor}
            />
            <div className="checkout-container-modern">
                <div className="checkout-header-modern">
                    <Link href={theme.baseRoute} className="checkout-back-modern">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Back</span>
                    </Link>
                    <h1 className="checkout-title-modern">Checkout</h1>
                    <div style={{ width: '60px' }}></div>
                </div>

                <div className="checkout-content-modern">
                    {/* Form Section */}
                    <div className="checkout-form-section-modern">
                        <h2 className="checkout-section-title-modern">Shipping Information</h2>
                        <form onSubmit={handleSubmit} id="checkout-form" className="checkout-form-modern">
                            <div className="checkout-form-grid-modern">
                                <div className="checkout-form-group-modern">
                                    <label className="checkout-label-modern">First Name</label>
                                    <input 
                                        name="firstName" 
                                        required 
                                        className="checkout-input-modern"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="checkout-form-group-modern">
                                    <label className="checkout-label-modern">Last Name</label>
                                    <input 
                                        name="lastName" 
                                        required 
                                        className="checkout-input-modern"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="checkout-form-group-modern">
                                <label className="checkout-label-modern">Phone Number</label>
                                <input 
                                    name="phoneNumber" 
                                    type="tel" 
                                    required 
                                    className="checkout-input-modern"
                                    placeholder="20 123 456"
                                />
                            </div>

                            <div className="checkout-form-group-modern">
                                <label className="checkout-label-modern">Address</label>
                                <input 
                                    name="address" 
                                    required 
                                    className="checkout-input-modern"
                                    placeholder="15 Rue de la Liberté"
                                />
                            </div>

                            <div className="checkout-form-group-modern">
                                <label className="checkout-label-modern">City</label>
                                <input 
                                    name="city" 
                                    required 
                                    className="checkout-input-modern"
                                    placeholder="Tunis"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Summary Section */}
                    <div className="checkout-summary-section-modern">
                        <h2 className="checkout-section-title-modern">Order Summary</h2>
                        <div className="checkout-items-modern">
                            {items.map(item => (
                                <div key={item.id} className="checkout-item-modern">
                                    <div className="checkout-item-image-modern">
                                        {item.image && (
                                            <Image 
                                                src={item.image} 
                                                alt={item.name} 
                                                width={80} 
                                                height={80}
                                                className="checkout-item-img-modern"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                        )}
                                        {!item.image && (
                                            <div className="checkout-item-placeholder-modern">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                                    <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="checkout-item-details-modern">
                                        <div className="checkout-item-name-modern">{item.name}</div>
                                        <div className="checkout-item-store-modern">{item.storeName}</div>
                                        <div className="checkout-item-meta-modern">
                                            <span className="checkout-item-price-modern">{item.price} DT</span>
                                            <span className="checkout-item-quantity-modern">× {item.quantity}</span>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => removeFromCart(item.id)} 
                                        className="checkout-item-remove-modern"
                                        aria-label="Remove item"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="checkout-totals-modern">
                            <div className="checkout-total-row-modern">
                                <span>Subtotal</span>
                                <span>{cartTotal} DT</span>
                            </div>
                            <div className="checkout-total-row-modern">
                                <span>Shipping</span>
                                <span>{shippingCost} DT</span>
                            </div>
                            <div className="checkout-total-row-modern checkout-total-final-modern">
                                <span>Total</span>
                                <span>{total} DT</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={isSubmitting}
                            className="checkout-submit-btn-modern"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="checkout-spinner-modern" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32">
                                            <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                                            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                                        </circle>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                'Place Order'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

