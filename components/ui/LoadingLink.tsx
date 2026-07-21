'use client';

import {
    useRouter,
    usePathname,
    useSearchParams,
} from 'next/navigation';

import {
    useEffect,
    useState,
    type MouseEvent,
    type ReactNode,
} from 'react';

import {
    AnimatePresence,
    motion,
    type HTMLMotionProps,
} from 'framer-motion';

import {
    springResponsive,
    navLinkVariants,
} from '@/lib/interactions';

interface LoadingLinkProps
    extends Omit<
        HTMLMotionProps<'a'>,
        'href' | 'children' | 'onClick'
    > {
    href: string;
    children: ReactNode;
    className?: string;

    /** Display a spinner while navigating. */
    showSpinner?: boolean;

    /** Disable the default Framer Motion hover and tap animations. */
    disableAnimation?: boolean;

    /** Render the inner content as a full-width block. */
    blockContent?: boolean;

    onClick?: (
        event: MouseEvent<HTMLAnchorElement>
    ) => void;
}

export default function LoadingLink({
    href,
    children,
    className,
    onClick,
    showSpinner = true,
    disableAnimation = false,
    blockContent = false,
    style,
    target,
    ...motionProps
}: LoadingLinkProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(false);
    }, [pathname, searchParams]);

    const handleClick = (
        event: MouseEvent<HTMLAnchorElement>
    ) => {
        const isExternalHref =
            href.startsWith('http://') ||
            href.startsWith('https://') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:');

        const isModifiedClick =
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0;

        const opensInNewTab = target === '_blank';

        if (
            isExternalHref ||
            isModifiedClick ||
            opensInNewTab
        ) {
            onClick?.(event);
            return;
        }

        if (isLoading) {
            event.preventDefault();
            return;
        }

        onClick?.(event);

        if (event.defaultPrevented) {
            return;
        }

        if (href.startsWith('#')) {
            return;
        }

        if (href === pathname) {
            event.preventDefault();
            setIsLoading(false);
            return;
        }

        event.preventDefault();
        setIsLoading(true);

        router.push(href);
    };

    return (
        <motion.a
            {...motionProps}
            href={href}
            target={target}
            onClick={handleClick}
            className={className}
            aria-busy={isLoading}
            aria-disabled={isLoading || undefined}
            initial={
                disableAnimation
                    ? undefined
                    : 'idle'
            }
            whileHover={
                !isLoading && !disableAnimation
                    ? 'hover'
                    : undefined
            }
            whileTap={
                !isLoading && !disableAnimation
                    ? 'tap'
                    : undefined
            }
            variants={
                disableAnimation
                    ? undefined
                    : navLinkVariants
            }
            animate={
                isLoading
                    ? { opacity: 0.72 }
                    : disableAnimation
                      ? { opacity: 1 }
                      : 'idle'
            }
            transition={springResponsive}
            style={{
                display: blockContent
                    ? 'block'
                    : 'inline-flex',

                alignItems: blockContent
                    ? undefined
                    : 'center',

                justifyContent: blockContent
                    ? undefined
                    : 'center',

                gap: blockContent
                    ? undefined
                    : '8px',

                position: 'relative',
                color: 'inherit',

                cursor: isLoading
                    ? 'not-allowed'
                    : 'pointer',

                textDecoration: 'none',
                ...style,
            }}
        >
            <AnimatePresence
                initial={false}
                mode="wait"
            >
                <motion.span
                    key={
                        isLoading
                            ? 'loading'
                            : 'content'
                    }
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                        display: blockContent
                            ? 'block'
                            : 'inline-flex',

                        width: blockContent
                            ? '100%'
                            : undefined,

                        alignItems: blockContent
                            ? undefined
                            : 'center',

                        justifyContent: blockContent
                            ? undefined
                            : 'center',

                        gap: blockContent
                            ? undefined
                            : '8px',
                    }}
                >
                    {children}

                    {isLoading && showSpinner && (
                        <motion.span
                            aria-hidden="true"
                            initial={{
                                scale: 0,
                                opacity: 0,
                            }}
                            animate={{
                                rotate: 360,
                                scale: 1,
                                opacity: 1,
                            }}
                            transition={{
                                rotate: {
                                    duration: 0.8,
                                    repeat: Infinity,
                                    ease: 'linear',
                                },
                                scale: {
                                    duration: 0.15,
                                },
                            }}
                            style={{
                                display: 'inline-block',
                                flexShrink: 0,
                                width: '1em',
                                height: '1em',
                                border: '2px solid currentColor',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                            }}
                        />
                    )}
                </motion.span>
            </AnimatePresence>
        </motion.a>
    );
}