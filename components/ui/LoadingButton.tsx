'use client';

import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useEffect } from 'react';
import {
    buttonPrimaryVariants,
    springResponsive,
    rippleVariants,
    loadingVariants,
    springBouncy
} from '@/lib/interactions';

interface LoadingButtonProps extends HTMLMotionProps<"button"> {
    children: ReactNode;
    isLoading?: boolean;
    isSuccess?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
    className?: string;
    /**
     * Enhanced tactile feedback - adds ripple effect and stronger spring
     */
    enhanced?: boolean;
    /**
     * Size of the button
     */
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function LoadingButton({
    children,
    isLoading = false,
    isSuccess = false,
    variant = 'primary',
    className = '',
    disabled,
    enhanced = true,
    onClick,
    size = 'md',
    ...props
}: LoadingButtonProps) {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    // Size mappings
    const sizeStyles = {
        sm: { padding: '8px 16px', fontSize: '14px', height: '36px' },
        md: { padding: '12px 24px', fontSize: '16px', height: '48px' },
        lg: { padding: '16px 32px', fontSize: '18px', height: '56px' },
        xl: { padding: '20px 40px', fontSize: '20px', height: '64px' },
    };

    // Variant color mappings
    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
                    color: '#ffffff',
                    border: 'none',
                };
            case 'secondary':
                return {
                    background: 'rgba(0, 0, 0, 0.05)',
                    color: '#000000',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                };
            case 'outline':
                return {
                    background: 'transparent',
                    color: '#000000',
                    border: '2px solid #000000',
                };
            case 'danger':
                return {
                    background: 'linear-gradient(135deg, #ff4d4d 0%, #cc0000 100%)',
                    color: '#ffffff',
                    border: 'none',
                };
            case 'ghost':
                return {
                    background: 'transparent',
                    color: '#000000',
                    border: 'none',
                };
            case 'success':
                return {
                    background: 'linear-gradient(135deg, #41eb5c 0%, #2dbb45 100%)',
                    color: '#ffffff',
                    border: 'none',
                };
            default:
                return {
                    background: '#000000',
                    color: '#ffffff',
                    border: 'none',
                };
        }
    };

    const variantStyles = getVariantStyles();

    // Base styles
    const baseStyles = {
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        fontWeight: '600' as const,
        borderRadius: '12px',
        outline: 'none',
        overflow: 'hidden',
        userSelect: 'none' as const,
        transition: 'background 0.3s ease, border-color 0.3s ease',
        ...sizeStyles[size],
        ...variantStyles,
    };

    // Handle click with ripple effect
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || isLoading || isSuccess) return;

        // Create ripple effect
        if (enhanced) {
            const button = e.currentTarget;
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const id = Date.now();

            setRipples(prev => [...prev, { x, y, id }]);

            // Remove ripple after animation
            setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== id));
            }, 600);
        }

        onClick?.(e);
    };

    // Premium spinner component
    const Spinner = ({ isDark = false }: { isDark?: boolean }) => (
        <motion.div
            style={{
                width: '24px',
                height: '24px',
                border: isDark
                    ? '3px solid rgba(0,0,0,0.1)'
                    : '3px solid rgba(255,255,255,0.2)',
                borderTop: isDark
                    ? '3px solid rgba(0,0,0,0.8)'
                    : '3px solid #ffffff',
                borderRadius: '50%',
            }}
            animate={{ rotate: 360 }}
            transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "linear"
            }}
        />
    );

    // Success Checkmark
    const SuccessIcon = () => (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springBouncy}
        >
            <motion.path
                d="M5 13L9 17L19 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            />
        </motion.svg>
    );

    const isDarkSpinner = variant === 'outline' || variant === 'ghost' || variant === 'secondary';

    return (
        <motion.button
            initial="idle"
            whileHover={!disabled && !isLoading && !isSuccess ? "hover" : undefined}
            whileTap={!disabled && !isLoading && !isSuccess ? "tap" : undefined}
            variants={enhanced ? buttonPrimaryVariants : undefined}
            animate={
                isLoading
                    ? { scale: 0.97, opacity: 0.9 }
                    : isSuccess
                        ? { scale: 1.02, background: 'linear-gradient(135deg, #41eb5c 0%, #2dbb45 100%)' }
                        : "idle"
            }
            transition={enhanced ? springResponsive : { type: "spring", stiffness: 400, damping: 17 }}
            disabled={disabled || isLoading || isSuccess}
            className={className}
            style={{
                ...baseStyles,
                ...props.style,
                opacity: disabled ? 0.5 : undefined,
            }}
            onClick={handleClick}
            {...props}
        >
            {/* Ripple effects */}
            <AnimatePresence>
                {enhanced && ripples.map(ripple => (
                    <motion.span
                        key={ripple.id}
                        variants={rippleVariants}
                        initial="initial"
                        animate="animate"
                        exit="initial"
                        style={{
                            position: 'absolute',
                            left: ripple.x,
                            top: ripple.y,
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: variant === 'primary' || variant === 'danger' || variant === 'success'
                                ? 'rgba(255, 255, 255, 0.4)'
                                : 'rgba(0, 0, 0, 0.1)',
                            pointerEvents: 'none',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 0,
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Content Switcher */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Spinner isDark={isDarkSpinner} />
                        </motion.div>
                    ) : isSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={springBouncy}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <SuccessIcon />
                            <span>Terminé</span>
                        </motion.div>
                    ) : (
                        <motion.span
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            {children}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
}
