'use client';

import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';
import type { MenuItem } from '../types';
import Link from 'next/link';
import LoadingLink from '../ui/LoadingLink';
import { springSmooth, springResponsive } from '@/lib/interactions';

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

// Animation variants for the overlay
const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
    },
    exit: {
        opacity: 0,
    }
};

const overlayTransition: Transition = {
    duration: 0.25,
    ease: 'easeOut'
};

// Animation variants for the slide-in sheet
const sheetVariants: Variants = {
    hidden: {
        x: '100%',
        opacity: 0.8,
    },
    visible: {
        x: 0,
        opacity: 1,
    },
    exit: {
        x: '100%',
        opacity: 0.8,
    }
};

// Stagger animation for menu items
const menuContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.15
        }
    },
    exit: {
        opacity: 0,
        transition: {
            staggerChildren: 0.03,
            staggerDirection: -1
        }
    }
};

const menuItemVariants: Variants = {
    hidden: {
        opacity: 0,
        x: 30,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
    },
    exit: {
        opacity: 0,
        x: 20,
        scale: 0.95,
    }
};

// Close button animation
const closeButtonVariants: Variants = {
    initial: { rotate: -90, opacity: 0, scale: 0.8 },
    animate: {
        rotate: 0,
        opacity: 1,
        scale: 1,
    },
    tap: {
        scale: 0.85,
        rotate: 90,
    },
    hover: {
        scale: 1.1,
    }
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
    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    className={overlayClassName}
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={overlayTransition}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        zIndex: 1000,
                    }}
                    onClick={onClose}
                >
                    <motion.div
                        className={sheetClassName}
                        variants={sheetVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={springSmooth}
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
                            borderTopLeftRadius: '24px',
                            borderBottomLeftRadius: '24px',
                            boxSizing: 'border-box',
                            overflowY: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                            <motion.button
                                onClick={onClose}
                                aria-label="Fermer le menu"
                                type="button"
                                className={closeButtonClassName}
                                variants={closeButtonVariants}
                                initial="initial"
                                animate="animate"
                                whileTap="tap"
                                whileHover="hover"
                                transition={springResponsive}
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    background: 'rgba(0, 0, 0, 0.05)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#0d1c23',
                                    fontSize: 28,
                                    lineHeight: 1,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                ×
                            </motion.button>
                        </div>

                        {/* Navigation Items */}
                        <motion.nav
                            className={navClassName}
                            variants={menuContainerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                        >
                            {items.map((item, index) => {
                                const handleClick = (e: React.MouseEvent) => {
                                    onClose();
                                    if (item.onClick) {
                                        e.preventDefault();
                                        item.onClick();
                                    }
                                };

                                const itemStyle = {
                                    color: '#0d1c23',
                                    textDecoration: 'none',
                                    fontSize: 18,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left' as const,
                                    width: '100%',
                                    fontWeight: 500,
                                };

                                if (item.onClick) {
                                    return (
                                        <motion.button
                                            key={index}
                                            onClick={handleClick}
                                            variants={menuItemVariants}
                                            whileHover={{
                                                x: 8,
                                                backgroundColor: 'rgba(65, 235, 92, 0.1)',
                                            }}
                                            whileTap={{
                                                scale: 0.97,
                                            }}
                                            transition={springResponsive}
                                            style={itemStyle}
                                        >
                                            {item.icon && (
                                                <motion.span
                                                    style={{ fontSize: 24, width: 32, textAlign: 'center' }}
                                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                                    transition={springResponsive}
                                                >
                                                    {item.icon}
                                                </motion.span>
                                            )}
                                            <span>{item.label}</span>
                                        </motion.button>
                                    );
                                }

                                return (
                                    <motion.div
                                        key={index}
                                        variants={menuItemVariants}
                                        whileHover={{
                                            x: 8,
                                            backgroundColor: 'rgba(65, 235, 92, 0.1)',
                                        }}
                                        whileTap={{
                                            scale: 0.97,
                                        }}
                                        transition={springResponsive}
                                        style={{ borderRadius: '12px' }}
                                    >
                                        <LoadingLink
                                            href={item.href}
                                            style={itemStyle}
                                            onClick={handleClick}
                                            showSpinner={true}
                                        >
                                            {item.icon && (
                                                <motion.span
                                                    style={{ fontSize: 24, width: 32, textAlign: 'center' }}
                                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                                    transition={springResponsive}
                                                >
                                                    {item.icon}
                                                </motion.span>
                                            )}
                                            <span>{item.label}</span>
                                        </LoadingLink>
                                    </motion.div>
                                );
                            })}
                        </motion.nav>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
