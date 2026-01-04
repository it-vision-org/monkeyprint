'use client';

import Link from "next/link";
import { format } from "date-fns";
import StoreHeader from "@/components/StoreHeader";
import type { ThemeConfig } from '@/components/themeConfig';
import Image from "next/image";

type Customization = {
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
    backgroundColor?: string | null;
    textColor?: string | null;
    headingColor?: string | null;
    headerBackgroundColor?: string | null;
    headerTextColor?: string | null;
    fontFamily?: string | null;
    headingFontWeight?: string | null;
    bodyFontWeight?: string | null;
};

type OrderConfirmationClientProps = {
    storeSlug: string;
    theme: ThemeConfig;
    customization?: Customization;
    orders: any[];
};

export default function OrderConfirmationClient({ 
    storeSlug, 
    theme, 
    customization,
    orders 
}: OrderConfirmationClientProps) {
    const getPageClassName = () => {
        const baseClass = 'order-confirmation-page-modern';
        if (theme.id === 'theme-2') return `${baseClass} order-confirmation-theme-2`;
        if (theme.id === 'theme-3') return `${baseClass} order-confirmation-theme-3`;
        return `${baseClass} order-confirmation-theme-1`;
    };

    // Build CSS variables for dynamic colors
    const cssVariables: React.CSSProperties & Record<string, string> = {};
    if (customization) {
        if (customization.primaryColor) cssVariables['--theme-primary'] = customization.primaryColor;
        if (customization.secondaryColor) cssVariables['--theme-secondary'] = customization.secondaryColor;
        if (customization.accentColor) cssVariables['--theme-accent'] = customization.accentColor;
        if (customization.backgroundColor) cssVariables['--theme-bg'] = customization.backgroundColor;
        if (customization.textColor) cssVariables['--theme-text'] = customization.textColor;
        if (customization.headingColor) cssVariables['--theme-heading'] = customization.headingColor;
        if (customization.headerBackgroundColor) cssVariables['--theme-header-bg'] = customization.headerBackgroundColor;
        if (customization.headerTextColor) cssVariables['--theme-header-text'] = customization.headerTextColor;
    }

    // Use headerTextColor for cart icon if available, otherwise fall back to theme's cartStrokeColor
    const cartIconColor = customization?.headerTextColor || theme.cartStrokeColor || '#1f2937';

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'En attente';
            case 'PAID': return 'Payé';
            case 'SHIPPED': return 'Expédié';
            case 'COMPLETED': return 'Terminé';
            case 'RETURNED': return 'Retourné';
            default: return status;
        }
    };

    return (
        <div className={getPageClassName()} style={cssVariables}>
            <StoreHeader
                cartCount={0}
                cartHref={`${theme.baseRoute}/cart`}
                logoFilter={theme.logoFilter}
                className={theme.headerClassName}
                containerClassName={theme.containerClassName}
                cartButtonClassName={theme.cartButtonClassName}
                cartBadgeClassName={theme.cartBadgeClassName}
                cartStrokeColor={cartIconColor}
            />
            <div className="order-confirmation-container-modern">
                <div className="order-confirmation-header-modern">
                    <div className="order-confirmation-icon-modern">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h1 className="order-confirmation-title-modern">Merci pour votre commande !</h1>
                    <p className="order-confirmation-subtitle-modern">
                        Votre commande a été reçue et est en cours de traitement.<br />
                        Nous vous contacterons bientôt pour confirmer la livraison.
                    </p>
                </div>

                {orders.length > 0 && (
                    <div className="order-confirmation-details-modern">
                        <h2 className="order-confirmation-section-title-modern">Détails de la commande</h2>
                        {orders.map((order, orderIdx) => (
                            <div key={order.id} className={`order-confirmation-order-modern ${orderIdx < orders.length - 1 ? 'order-confirmation-order-separator' : ''}`}>
                                <div className="order-confirmation-order-header-modern">
                                    <div>
                                        <h3 className="order-confirmation-store-name-modern">{order.store.name}</h3>
                                        <div className="order-confirmation-order-meta-modern">
                                            <p className="order-confirmation-order-id-modern">
                                                Commande #{order.id.slice(0, 8)} • {format(new Date(order.createdAt), "d MMMM yyyy 'à' HH:mm")}
                                            </p>
                                            {order.deletionRequested && (
                                                <span className="order-confirmation-deletion-badge-modern">
                                                    Suppression demandée
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="order-confirmation-order-total-modern">
                                        <p className="order-confirmation-total-amount-modern">{order.totalAmount.toFixed(2)} DT</p>
                                        <p className="order-confirmation-status-modern">
                                            {getStatusLabel(order.status)}
                                        </p>
                                    </div>
                                </div>
                                <div className="order-confirmation-items-modern">
                                    {order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="order-confirmation-item-modern">
                                            {item.imageUrl && (
                                                <div className="order-confirmation-item-image-modern">
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.product.name}
                                                        width={80}
                                                        height={80}
                                                        className="order-confirmation-item-img-modern"
                                                    />
                                                </div>
                                            )}
                                            <div className="order-confirmation-item-details-modern">
                                                <p className="order-confirmation-item-name-modern">{item.product.name}</p>
                                                <p className="order-confirmation-item-meta-modern">
                                                    Quantité: {item.quantity} × {item.price.toFixed(2)} DT
                                                </p>
                                                <p className="order-confirmation-item-price-modern">{(item.price * item.quantity).toFixed(2)} DT</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="order-confirmation-actions-modern">
                    <Link href={theme.baseRoute} className="order-confirmation-button-modern">
                        Trouver d&apos;autres produits
                    </Link>
                </div>
            </div>
        </div>
    );
}

