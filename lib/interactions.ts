/**
 * Premium Interaction System for MonkeyPrint
 * 
 * This file contains reusable animation variants and interaction presets
 * that create a tactile, premium feel across all devices.
 */

import { Transition, Variants } from 'framer-motion';

// ============================================================================
// SPRING PHYSICS PRESETS
// ============================================================================

/**
 * Bouncy spring - for playful, attention-grabbing interactions
 * Use for: Hero CTAs, primary actions, celebrating success states
 */
export const springBouncy: Transition = {
    type: 'spring',
    stiffness: 400,
    damping: 10,
};

/**
 * Responsive spring - for immediate, tactile feedback
 * Use for: Buttons, clickable cards, interactive elements
 */
export const springResponsive: Transition = {
    type: 'spring',
    stiffness: 500,
    damping: 25,
};

/**
 * Smooth spring - for elegant, polished transitions
 * Use for: Navigation, page transitions, modal appearances
 */
export const springSmooth: Transition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
};

/**
 * Gentle spring - for subtle, ambient animations
 * Use for: Hover states, soft interactions, secondary actions
 */
export const springGentle: Transition = {
    type: 'spring',
    stiffness: 200,
    damping: 20,
};

// ============================================================================
// INTERACTION VARIANTS
// ============================================================================

/**
 * Primary Button Interaction
 * Creates a satisfying press-and-release feeling with depth
 */
export const buttonPrimaryVariants: Variants = {
    idle: {
        scale: 1,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    },
    hover: {
        scale: 1.02,
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
        transition: springGentle,
    },
    tap: {
        scale: 0.96,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: springResponsive,
    },
};

/**
 * Hero CTA Interaction
 * More dramatic movement for primary conversion points
 */
export const heroCTAVariants: Variants = {
    idle: {
        scale: 1,
        y: 0,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    },
    hover: {
        scale: 1.05,
        y: -2,
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.25)',
        transition: springGentle,
    },
    tap: {
        scale: 0.97,
        y: 0,
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.15)',
        transition: springResponsive,
    },
};

/**
 * Card Interaction
 * Lift effect that feels like picking up a physical card
 */
export const cardVariants: Variants = {
    idle: {
        y: 0,
        scale: 1,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    hover: {
        y: -8,
        scale: 1.02,
        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.12)',
        transition: springSmooth,
    },
    tap: {
        y: -4,
        scale: 0.98,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        transition: springResponsive,
    },
};

/**
 * Product Card Interaction
 * Optimized for e-commerce browsing
 */
export const productCardVariants: Variants = {
    idle: {
        y: 0,
        scale: 1,
    },
    hover: {
        y: -12,
        scale: 1.03,
        transition: springSmooth,
    },
    tap: {
        y: -6,
        scale: 0.99,
        transition: springResponsive,
    },
};

/**
 * Icon Button Interaction
 * Quick, snappy feedback for small targets
 */
export const iconButtonVariants: Variants = {
    idle: {
        scale: 1,
        rotate: 0,
    },
    hover: {
        scale: 1.1,
        transition: springGentle,
    },
    tap: {
        scale: 0.9,
        rotate: -5,
        transition: springResponsive,
    },
};

/**
 * Navigation Link Interaction
 * Subtle but noticeable feedback
 */
export const navLinkVariants: Variants = {
    idle: {
        x: 0,
        scale: 1,
    },
    hover: {
        x: 4,
        scale: 1.02,
        transition: springGentle,
    },
    tap: {
        x: 2,
        scale: 0.98,
        transition: springResponsive,
    },
};

/**
 * Chip/Tag Interaction
 * Toggle-style interaction with rotation
 */
export const chipVariants: Variants = {
    idle: {
        scale: 1,
        rotate: 0,
    },
    hover: {
        scale: 1.05,
        rotate: 2,
        transition: springGentle,
    },
    tap: {
        scale: 0.95,
        rotate: -2,
        transition: springResponsive,
    },
    selected: {
        scale: 1,
        rotate: 0,
        transition: springBouncy,
    },
};

/**
 * Input Field Interaction
 * Gentle response to focus/interaction
 */
export const inputVariants: Variants = {
    idle: {
        scale: 1,
        boxShadow: '0 0 0 0px rgba(65, 235, 92, 0)',
    },
    focus: {
        scale: 1.01,
        boxShadow: '0 0 0 3px rgba(65, 235, 92, 0.25)',
        transition: springGentle,
    },
};

// ============================================================================
// LOADING & STATE TRANSITIONS
// ============================================================================

/**
 * Loading State Variants
 * For buttons and elements showing progress
 */
export const loadingVariants: Variants = {
    loading: {
        opacity: 0.7,
        scale: 0.98,
        transition: {
            duration: 0.2,
        },
    },
    success: {
        scale: [1, 1.05, 1],
        opacity: 1,
        transition: {
            duration: 0.4,
            times: [0, 0.5, 1],
        },
    },
    error: {
        x: [-10, 10, -10, 10, 0],
        transition: {
            duration: 0.5,
        },
    },
};

/**
 * Ripple Effect Configuration
 * For creating Material Design-style ripples
 */
export const rippleVariants: Variants = {
    initial: {
        scale: 0,
        opacity: 0.5,
    },
    animate: {
        scale: 2,
        opacity: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
        },
    },
};

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

/**
 * Page Enter Animation
 */
export const pageEnterVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.2,
        },
    },
};

/**
 * Stagger Children Animation
 * For sequential reveals of list items
 */
export const staggerContainerVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

export const staggerItemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: springSmooth,
    },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Determine if device supports touch
 * Used to adjust interaction strength based on input method
 */
export const isTouchDevice = () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get appropriate tap target size based on device
 */
export const getTapTargetSize = () => {
    return isTouchDevice() ? 44 : 32; // iOS HIG recommends 44px for touch
};

/**
 * Create custom spring with parameters
 */
export const createSpring = (
    stiffness: number,
    damping: number
): Transition => ({
    type: 'spring',
    stiffness,
    damping,
});

/**
 * Scale preset for different interaction intensities
 */
export const scalePresets = {
    subtle: { hover: 1.01, tap: 0.99 },
    normal: { hover: 1.02, tap: 0.98 },
    medium: { hover: 1.05, tap: 0.95 },
    dramatic: { hover: 1.1, tap: 0.92 },
};
