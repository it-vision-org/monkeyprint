'use client';

import { useRouter } from 'next/navigation';

type CartButtonProps = {
    count: number;
    href: string;
    className?: string;
    badgeClassName?: string;
    strokeColor?: string;
};

export default function CartButton({ 
    count, 
    href, 
    className = '',
    badgeClassName = '',
    strokeColor = '#1f2937'
}: CartButtonProps) {
    const router = useRouter();

    return (
        <button 
            className={className}
            onClick={() => router.push(href)}
            aria-label={`Cart with ${count} items`}
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path 
                    d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" 
                    stroke={strokeColor} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </svg>
            {count > 0 && (
                <span className={badgeClassName}>{count}</span>
            )}
        </button>
    );
}

