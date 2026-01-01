'use client';

import type { MenuItem } from './types';
import Link from 'next/link';

type MobileMenuProps = {
    isOpen: boolean;
    onClose: () => void;
    items: MenuItem[];
    className?: string;
    overlayClassName?: string;
    sheetClassName?: string;
    closeButtonClassName?: string;
    navClassName?: string;
};

export default function MobileMenu({
    isOpen,
    onClose,
    items,
    className = '',
    overlayClassName = '',
    sheetClassName = '',
    closeButtonClassName = '',
    navClassName = ''
}: MobileMenuProps) {
    if (!isOpen) return null;

    return (
        <div 
            className={overlayClassName}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.25)',
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                className={sheetClassName}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '85%',
                    maxWidth: '400px',
                    minWidth: '280px',
                    height: '100%',
                    background: '#ffffff',
                    padding: '40px var(--mobile-padding-x, 18px)',
                    borderTopLeftRadius: '20px',
                    borderBottomLeftRadius: '20px',
                    boxSizing: 'border-box',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                    <button
                        onClick={onClose}
                        aria-label="Close menu"
                        type="button"
                        className={closeButtonClassName}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#0d1c23',
                            fontSize: 32,
                            lineHeight: 1,
                            cursor: 'pointer',
                        }}
                    >
                        ×
                    </button>
                </div>
                <nav className={navClassName} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {items.map((item, index) => {
                        const handleClick = (e: React.MouseEvent) => {
                            onClose();
                            if (item.onClick) {
                                e.preventDefault();
                                item.onClick();
                            }
                        };

                        if (item.onClick) {
                            return (
                                <button
                                    key={index}
                                    onClick={handleClick}
                                    style={{
                                        color: '#0d1c23',
                                        textDecoration: 'none',
                                        fontSize: 20,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        padding: 0
                                    }}
                                >
                                    {item.icon && <span style={{ fontSize: 22 }}>{item.icon}</span>}
                                    {item.label}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                style={{
                                    color: '#0d1c23',
                                    textDecoration: 'none',
                                    fontSize: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                }}
                                onClick={handleClick}
                            >
                                {item.icon && <span style={{ fontSize: 22 }}>{item.icon}</span>}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}

