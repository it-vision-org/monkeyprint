'use client';

import { motion } from 'framer-motion';

/**
 * PageTransition - Smooth page transitions without layout shift
 * 
 * Key improvements:
 * - Uses opacity-only animation to prevent layout jumps 
 * - Maintains layout stability with min-height
 * - Faster, more subtle animation for better UX
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1] // Material Design easing
            }}
            style={{
                minHeight: '100vh',
                width: '100%',
            }}
        >
            {children}
        </motion.div>
    );
}
