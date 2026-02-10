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

import styles from './MainHeader.module.css';

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
    mobileMenuProps = {},
    initialSession,
    hasStore = true
}: MainHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { data: clientSession } = useSession();
    const session = initialSession !== undefined ? initialSession : clientSession;
    const router = useRouter();

    const handleMenuToggle = (open: boolean) => {
        setIsMenuOpen(open);
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await signOut({ redirect: false });
        router.push('/');
        router.refresh();
    };

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
            <header className={`${styles.header} ${className}`}>
                <div className={styles.inner}>
                    <LoadingLink href="/" className={styles.logoContainer} showSpinner={false}>
                        <Image
                            src="/logo.png"
                            alt={logoAlt}
                            width={100}
                            height={50}
                            className={styles.logo}
                            priority
                            style={{ filter: logoFilter }}
                        />
                        {logoText && (
                            <span className={styles.logoText}>
                                {logoText}
                            </span>
                        )}
                    </LoadingLink>

                    {/* Desktop Navigation */}
                    <nav className={styles.desktopNav}>
                        {allMenuItems.map((item, index) => (
                            item.onClick ? (
                                <motion.button
                                    key={index}
                                    onClick={item.onClick}
                                    variants={navItemVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    whileTap="tap"
                                    className={styles.navItem}
                                >
                                    {item.icon && <span>{item.icon}</span>}
                                    {item.label}
                                    {isLoggingOut && item.label === "Se déconnecter" && (
                                        <span className={styles.spinner} />
                                    )}
                                </motion.button>
                            ) : (
                                <motion.div
                                    key={index}
                                    variants={navItemVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <LoadingLink
                                        href={item.href}
                                        className={styles.navItem}
                                        showSpinner={true}
                                    >
                                        {item.icon && <span>{item.icon}</span>}
                                        {item.label}
                                    </LoadingLink>
                                </motion.div>
                            )
                        ))}
                    </nav>

                    {/* Right Section: Cart + Mobile Menu Button */}
                    <div className={styles.rightSection}>
                        {showCart && (
                            <CartButton
                                count={cartCount}
                                href={cartHref}
                                strokeColor="#1f2937"
                            />
                        )}
                        <motion.button
                            className={styles.mobileMenuToggle}
                            onClick={() => handleMenuToggle(!isMenuOpen)}
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    className={styles.menuLine}
                                    animate={isMenuOpen ? {
                                        rotate: i === 0 ? 45 : i === 2 ? -45 : 0,
                                        y: i === 0 ? 9 : i === 2 ? -9 : 0,
                                        opacity: i === 1 ? 0 : 1
                                    } : {
                                        rotate: 0,
                                        y: 0,
                                        opacity: 1
                                    }}
                                    transition={springResponsive}
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
