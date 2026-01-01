'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut, Session } from 'next-auth/react';
import MobileMenu from './MobileMenu';
import CartButton from './CartButton';
import type { MenuItem } from './types';

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
    const { data: clientSession } = useSession();
    // Use initialSession if provided (from server), otherwise use client session
    const session = initialSession !== undefined ? initialSession : clientSession;
    const router = useRouter();
    const pathname = usePathname();

    const handleMenuToggle = (open: boolean) => {
        setIsMenuOpen(open);
    };

    const handleLogout = async () => {
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
            <style dangerouslySetInnerHTML={{__html: `
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
                position: 'sticky', 
                top: 0, 
                zIndex: 100,
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
                    <Link href="/" className={logoContainerClassName} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textDecoration: 'none'
                    }}>
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
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <nav className="main-header-desktop-nav" style={{
                        display: 'none',
                        alignItems: 'center',
                        gap: '32px'
                    }}>
                        {allMenuItems.map((item, index) => (
                            item.onClick ? (
                                <button
                                    key={index}
                                    onClick={item.onClick}
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
                                        padding: 0
                                    }}
                                >
                                    {item.icon && <span>{item.icon}</span>}
                                    {item.label}
                                </button>
                            ) : (
                                <Link
                                    key={index}
                                    href={item.href}
                                    style={{
                                        color: '#242424',
                                        textDecoration: 'none',
                                        fontSize: '16px',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {item.icon && <span>{item.icon}</span>}
                                    {item.label}
                                </Link>
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
                        <button
                            className={`${menuButtonClassName} main-header-mobile-menu-button`}
                            onClick={() => handleMenuToggle(true)}
                            aria-label="Open menu"
                            type="button"
                            style={{
                                width: '28px',
                                height: '20px',
                                border: 0,
                                background: 'transparent',
                                padding: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{
                                height: '2px',
                                background: '#414042',
                                width: '100%',
                                borderRadius: '2px'
                            }} />
                            <span style={{
                                height: '2px',
                                background: '#414042',
                                width: '100%',
                                borderRadius: '2px'
                            }} />
                            <span style={{
                                height: '2px',
                                background: '#414042',
                                width: '100%',
                                borderRadius: '2px'
                            }} />
                        </button>
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
