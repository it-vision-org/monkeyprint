'use client';

import React from 'react';
import Image from 'next/image';
import MobileMenu from './MobileMenu';
import type { MenuItem } from '../types';

type NavbarProps = {
    logoAlt?: string;
    logoText?: string;
    menuItems: MenuItem[];
    onMenuToggle?: (isOpen: boolean) => void;
    className?: string;
    logoContainerClassName?: string;
    logoClassName?: string;
    logoTextClassName?: string;
    menuButtonClassName?: string;
    menuButtonLineClassName?: string;
    mobileMenuProps?: Partial<React.ComponentProps<typeof MobileMenu>>;
};

export default function Navbar({
    logoAlt = 'Monkey Print',
    logoText = 'MONKEY PRINT',
    menuItems,
    onMenuToggle,
    className = '',
    logoContainerClassName = '',
    logoClassName = '',
    logoTextClassName = '',
    menuButtonClassName = '',
    menuButtonLineClassName = '',
    mobileMenuProps = {}
}: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleMenuToggle = (open: boolean) => {
        setIsMenuOpen(open);
        onMenuToggle?.(open);
    };

    return (
        <>
            <header className={className}>
                <div className={logoContainerClassName}>
                    <Image
                        src="/logo.png"
                        alt={logoAlt}
                        width={84}
                        height={42}
                        className={logoClassName}
                        priority
                    />
                    {logoText && <span className={logoTextClassName}>{logoText}</span>}
                </div>
                <button
                    className={menuButtonClassName}
                    onClick={() => handleMenuToggle(true)}
                    aria-label="Open menu"
                    type="button"
                >
                    <span className={menuButtonLineClassName} />
                    <span className={menuButtonLineClassName} />
                    <span className={menuButtonLineClassName} />
                </button>
            </header>

            <MobileMenu
                isOpen={isMenuOpen}
                onClose={() => handleMenuToggle(false)}
                items={menuItems}
                {...mobileMenuProps}
            />
        </>
    );
}
