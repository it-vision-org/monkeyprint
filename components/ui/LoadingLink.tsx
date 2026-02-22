'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { springResponsive, navLinkVariants } from '@/lib/interactions';

interface LoadingLinkProps extends React.ComponentProps<'a'> {
    href: string;
    children: React.ReactNode;
    className?: string;
    /** If true, shows a spinner. If false, just fades opacity */
    showSpinner?: boolean;
}

export default function LoadingLink({
    href,
    children,
    className,
    onClick,
    showSpinner = true,
    ...props
}: LoadingLinkProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(false);
    }, [pathname, searchParams]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (isLoading) {
            e.preventDefault();
            return;
        }

        if (onClick) {
            onClick(e);
        }

        if (href === pathname) {
            setIsLoading(false);
            return;
        }

        if (!e.defaultPrevented) {
            // Only start loading if we're actually navigating to a new route
            // or if it's a different query param
            if (href !== pathname && !href.startsWith('#')) {
                setIsLoading(true);
                // Use router.push for client-side navigation
                router.push(href);
            }
        }
    };

    return (
        <motion.a
            href={href}
            onClick={handleClick}
            className={className}
            initial="idle"
            whileHover={!isLoading ? "hover" : undefined}
            whileTap={!isLoading ? "tap" : undefined}
            variants={navLinkVariants}
            animate={isLoading ? { opacity: 0.7, x: 2 } : "idle"}
            transition={springResponsive}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                textDecoration: 'none',
                color: 'inherit',
                position: 'relative',
                ...props.style,
            }}
            {...props as any}
        >
            <AnimatePresence mode="wait">
                <motion.span
                    key={isLoading ? 'loading' : 'content'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {children}
                    {isLoading && showSpinner && (
                        <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            style={{
                                display: 'inline-block',
                                width: '1em',
                                height: '1em',
                                border: '2px solid currentColor',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                            }}
                            animate={{
                                rotate: 360,
                                scale: 1,
                                opacity: 1
                            }}
                            transition={{
                                rotate: { duration: 0.8, repeat: Infinity, ease: "linear" },
                                scale: { duration: 0.2 }
                            }}
                            aria-hidden="true"
                        />
                    )}
                </motion.span>
            </AnimatePresence>
        </motion.a>
    );
}
