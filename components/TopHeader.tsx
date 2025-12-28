'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CartButton from './CartButton';

type TopHeaderProps = {
    cartHref: string;
    cartCount?: number;
    logoFilter?: string;
    className?: string;
    innerClassName?: string;
    cartButtonClassName?: string;
    cartBadgeClassName?: string;
    cartStrokeColor?: string;
};

export default function TopHeader({
    cartHref,
    cartCount = 1,
    logoFilter,
    className = '',
    innerClassName = '',
    cartButtonClassName = '',
    cartBadgeClassName = '',
    cartStrokeColor = '#1f2937'
}: TopHeaderProps) {
    const router = useRouter();

    return (
        <header className={className}>
            <div className={innerClassName}>
                <Image 
                    src="/logo.png" 
                    alt="GrabMeShoe" 
                    width={110} 
                    height={36} 
                    style={{ objectFit: 'contain', filter: logoFilter || undefined }} 
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

