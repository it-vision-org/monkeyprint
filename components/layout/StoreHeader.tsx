'use client';

import Image from 'next/image';
import CartButton from '../ui/CartButton';

type StoreHeaderProps = {
    cartCount: number;
    cartHref: string;
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
    logoFilter,
    className = '',
    containerClassName = '',
    cartButtonClassName = '',
    cartBadgeClassName = '',
    cartStrokeColor = '#1f2937'
}: StoreHeaderProps) {
    return (
        <header className={className}>
            <div className={containerClassName}>
                <Image
                    src="/logo.png"
                    alt="Store Logo"
                    width={110}
                    height={36}
                    style={{
                        objectFit: 'contain',
                        filter: logoFilter || undefined
                    }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CartButton
                        count={cartCount}
                        href={cartHref}
                        className={cartButtonClassName}
                        badgeClassName={cartBadgeClassName}
                        strokeColor={cartStrokeColor}
                    />
                </div>
            </div>
        </header>
    );
}
