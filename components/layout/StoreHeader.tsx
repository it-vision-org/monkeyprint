'use client';

import Image from 'next/image';
import Link from 'next/link';
import CartButton from '../ui/CartButton';

type StoreHeaderProps = {
    cartCount: number;
    cartHref: string;
    homeHref?: string;
    logoFilter?: string;
    className?: string;
    containerClassName?: string;
    cartButtonClassName?: string;
    cartBadgeClassName?: string;
    cartStrokeColor?: string;
};

export default function StoreHeader({
    cartCount,
    cartHref,
    homeHref,
    logoFilter,
    className = '',
    containerClassName = '',
    cartButtonClassName = '',
    cartBadgeClassName = '',
    cartStrokeColor = '#1f2937'
}: StoreHeaderProps) {
    const inferredTheme = className.includes('theme-1-')
        ? 'theme-1'
        : className.includes('theme-2-')
            ? 'theme-2'
            : className.includes('theme-3-')
                ? 'theme-3'
                : null;

    const resolvedCartButtonClassName = inferredTheme
        ? `${inferredTheme}-cart-btn`
        : cartButtonClassName;
    const resolvedCartBadgeClassName = inferredTheme
        ? `${inferredTheme}-cart-badge`
        : cartBadgeClassName;
    const resolvedContainerClassName = inferredTheme
        ? `${inferredTheme}-container`
        : containerClassName;

    const resolvedHomeHref =
        homeHref ||
        (cartHref.endsWith('/cart') ? cartHref.slice(0, -'/cart'.length) : '/');

    return (
        <header className={className}>
            <div className={resolvedContainerClassName}>
                <Link href={resolvedHomeHref} aria-label="Retour à la boutique" style={{ display: 'inline-flex' }}>
                    <Image
                        src="/logo.png"
                        alt="Monkey Print"
                        width={110}
                        height={36}
                        style={{
                            objectFit: 'contain',
                            filter: logoFilter || undefined
                        }}
                    />
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CartButton
                        count={cartCount}
                        href={cartHref}
                        className={resolvedCartButtonClassName}
                        badgeClassName={resolvedCartBadgeClassName}
                        strokeColor={cartStrokeColor}
                    />
                </div>
            </div>
        </header>
    );
}
