'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import LoadingLink from './LoadingLink';
import Link from 'next/link'; // Keep Link if needed for types or specific uses, but prefer LoadingLink
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { motion } from 'framer-motion';
import MobileMenu from './MobileMenu';
import CartButton from './CartButton';
import type { MenuItem } from './types';
import { springResponsive, navLinkVariants } from '@/lib/interactions';

type MainHeaderProps = {
    // Logo customization
    logoAlt?: string;
    logoText?: string;
    logoFilter?: string;

    // Navigation
    menuItems?: MenuItem[];
    showCart?: boolean;
    cartHref?: string;
    cartCount?: number;

    // Styling
    className?: string;
    innerClassName?: string;
    logoContainerClassName?: string;
    logoClassName?: string;
    logoTextClassName?: string;
    menuButtonClassName?: string;

    // Mobile menu styling
    mobileMenuProps?: Partial<React.ComponentProps<typeof MobileMenu>>;

    // Optional initial session to prevent loading flash
    initialSession?: Session | null;

    // Whether to show dashboard link (only show if user has a store)
    hasStore?: boolean;
};

const defaultMenuItems: MenuItem[] = [
    { label: "Accueil", href: "/", icon: "🏠" },
    { label: "Découvrez les boutiques", href: "/stores", icon: "🔥" },
    { label: "Contactez-nous", href: "/contact", icon: "💬" },
];

// Hamburger menu line animations
const lineVariants = {
    closed: {
        rotate: 0,
        y: 0,
        opacity: 1,
    },
    open: (custom: number) => ({
        rotate: custom === 0 ? 45 : custom === 2 ? -45 : 0,
        y: custom === 0 ? 9 : custom === 2 ? -9 : 0,
        opacity: custom === 1 ? 0 : 1,
        transition: springResponsive,
    }),
};

// Desktop nav link hover effect
const navItemVariants = {
    initial: { scale: 1 },
    hover: {
        scale: 1.02,
        transition: springResponsive
    },
    tap: {
        scale: 0.97,
        transition: springResponsive
    }
};

export default function MainHeader({
    logoAlt = 'Monkey Print',
    logoText = 'MONKEY PRINT',
    logoFilter,
    menuItems = defaultMenuItems,
    showCart = false,
    cartHref = '/store/theme-1/cart',
    cartCount = 0,
    className = '',
    innerClassName = '',
    logoContainerClassName = '',
    logoClassName = '',
    logoTextClassName = '',
    menuButtonClassName = '',
    mobileMenuProps = {},
    initialSession,
    hasStore = true // Default to true for backward compatibility
}: MainHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { data: clientSession } = useSession();
    // Use initialSession if provided (from server), otherwise use client session
    const session = initialSession !== undefined ? initialSession : clientSession;
    const router = useRouter();
    const pathname = usePathname();

    const handleMenuToggle = (open: boolean) => {
        setIsMenuOpen(open);
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await signOut({ redirect: false });
        router.push('/');
        router.refresh();
    };

    // Build menu items with auth-aware links
    const allMenuItems: MenuItem[] = [
        ...menuItems,
        ...(session?.user
            ? [
                ...(hasStore ? [{ label: "Tableau de bord", href: "/dashboard", icon: "📊" }] : []),
                { label: "Se déconnecter", href: "#", icon: "🚪", onClick: handleLogout }
            ]
            : [
                { label: "Se connecter", href: "/login", icon: "👤" },
                { label: "Créer une boutique", href: "/create-shop", icon: "➕" }
            ]
        )
    ];

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                .main-header-mobile-menu-button {
                    display: flex;
                }
                .main-header-desktop-nav {
                    display: none;
                }
                .main-header-inner {
                    padding: 0 var(--mobile-padding-x, 18px);
                }
                @media (min-width: 769px) {
                    .main-header-mobile-menu-button {
                        display: none !important;
                    }
                    .main-header-desktop-nav {
                        display: flex !important;
                    }
                    .main-header-inner {
                        padding: 0 40px;
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                }
            `}} />
            <header className={className} style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 1000,
                background: '#ffffff',
                boxShadow: '0px 4px 11.4px -4px rgba(0, 0, 0, 0.25)'
            }}>
                <div className={`${innerClassName} main-header-inner`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 var(--mobile-padding-x, 18px)',
                    height: '56px',
                    maxWidth: '100%',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <LoadingLink href="/" className={logoContainerClassName} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textDecoration: 'none'
                    }} showSpinner={false}>
                        <Image
                            src="/logo.png"
                            alt={logoAlt}
                            width={84}
                            height={42}
                            className={logoClassName}
                            priority
                            style={{
                                objectFit: 'contain',
                                filter: logoFilter || undefined,
                                height: '42px',
                                width: 'auto'
                            }}
                        />
                        {logoText && (
                            <span className={logoTextClassName} style={{
                                fontFamily: 'Inter, sans-serif',
                                fontStyle: 'normal',
                                fontWeight: 700,
                                fontSize: '16px',
                                lineHeight: '20px',
                                color: '#242424'
                            }}>
                                {logoText}
                            </span>
                        )}
                    </LoadingLink>

                    {/* Desktop Navigation */}
                    <nav className="main-header-desktop-nav" style={{
                        display: 'none',
                        alignItems: 'center',
                        gap: '32px'
                    }}>
                        {allMenuItems.map((item, index) => (
                            item.onClick ? (
                                <motion.button
                                    key={index}
                                    onClick={item.onClick}
                                    variants={navItemVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    whileTap="tap"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#242424',
                                        fontSize: '16px',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        position: 'relative',
                                    }}
                                >
                                    {item.icon && <span>{item.icon}</span>}
                                    {item.label}
                                    {isLoggingOut && item.label === "Se déconnecter" && (
                                        <span style={{
                                            marginLeft: 8,
                                            display: 'inline-block',
                                            width: 12,
                                            height: 12,
                                            border: '2px solid currentColor',
                                            borderTopColor: 'transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                    )}
                                </motion.button>
                            ) : (
                                <motion.div
                                    key={index}
                                    variants={navItemVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    whileTap="tap"
                                    style={{ borderRadius: '8px' }}
                                >
                                    <LoadingLink
                                        href={item.href}
                                        style={{
                                            color: '#242424',
                                            textDecoration: 'none',
                                            fontSize: '16px',
                                            fontFamily: 'Inter, sans-serif',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 12px',
                                        }}
                                        showSpinner={true}
                                    >
                                        {item.icon && <span>{item.icon}</span>}
                                        {item.label}
                                    </LoadingLink>
                                </motion.div>
                            )
                        ))}
                    </nav>

                    {/* Mobile Menu Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {showCart && (
                            <CartButton
                                count={cartCount}
                                href={cartHref}
                                className=""
                                badgeClassName=""
                                strokeColor="#1f2937"
                            />
                        )}
                        <motion.button
                            className={`${menuButtonClassName} main-header-mobile-menu-button`}
                            onClick={() => handleMenuToggle(!isMenuOpen)}
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            transition={springResponsive}
                            style={{
                                width: '44px',
                                height: '44px',
                                border: 0,
                                background: 'transparent',
                                padding: '10px 8px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                borderRadius: '8px',
                            }}
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    custom={i}
                                    variants={lineVariants}
                                    animate={isMenuOpen ? 'open' : 'closed'}
                                    style={{
                                        height: '2px',
                                        background: '#414042',
                                        width: '100%',
                                        borderRadius: '2px',
                                        display: 'block',
                                        transformOrigin: 'center',
                                    }}
                                />
                            ))}
                        </motion.button>
                    </div>
                </div>
            </header>

            <MobileMenu
                isOpen={isMenuOpen}
                onClose={() => handleMenuToggle(false)}
                items={allMenuItems}
                {...mobileMenuProps}
            />
        </>
    );
}
