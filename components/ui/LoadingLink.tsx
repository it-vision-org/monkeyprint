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
    /** If true, disables link hover/tap motion variants */
    disableAnimation?: boolean;
    /** If true, render child wrapper as block (full width) instead of inline flex */
    blockContent?: boolean;
}

export default function LoadingLink({
    href,
    children,
    className,
    onClick,
    showSpinner = true,
    disableAnimation = false,
    blockContent = false,
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
        const isExternalHref =
            href.startsWith("http://") ||
            href.startsWith("https://") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:");

        if (isExternalHref) {
            return;
        }

        if (
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey ||
            e.button !== 0
        ) {
            return;
        }

        if (isLoading) {
            e.preventDefault();
            return;
        }

        if (onClick) {
            onClick(e);
        }

        if (href === pathname || href.startsWith("#")) {
            setIsLoading(false);
            return;
        }

        if (!e.defaultPrevented) {
            e.preventDefault();
            setIsLoading(true);
            router.push(href);
        }
    };

    return (
        <motion.a
            href={href}
            onClick={handleClick}
            className={className}
            initial={disableAnimation ? undefined : "idle"}
            whileHover={!isLoading && !disableAnimation ? "hover" : undefined}
            whileTap={!isLoading && !disableAnimation ? "tap" : undefined}
            variants={disableAnimation ? undefined : navLinkVariants}
            animate={isLoading ? { opacity: 0.7, x: 2 } : "idle"}
            transition={springResponsive}
            style={{
                display: blockContent ? 'block' : 'inline-flex',
                alignItems: blockContent ? undefined : 'center',
                gap: blockContent ? undefined : '8px',
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
                    style={{
                        display: blockContent ? 'block' : 'inline-flex',
                        width: blockContent ? '100%' : undefined,
                        alignItems: blockContent ? undefined : 'center',
                        gap: blockContent ? undefined : '8px',
                    }}
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
