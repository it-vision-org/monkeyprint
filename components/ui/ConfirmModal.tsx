'use client';

import { useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import styles from './ConfirmModal.module.css';

type ConfirmModalProps = {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
};

export default function ConfirmModal({
    isOpen,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    type = 'warning'
}: ConfirmModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [isOpen, onCancel]);

    // Handle multi-line messages (split by \n)
    const messageLines = message.split('\n');

    // Icon based on type
    const getIcon = () => {
        switch (type) {
            case 'danger':
                return (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                );
            case 'warning':
                return (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                );
            default:
                return (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                );
        }
    };

    // Background color based on type
    const getIconBg = () => {
        switch (type) {
            case 'danger':
                return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            case 'warning':
                return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            default:
                return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
        }
    };

    // Confirm button color based on type
    const getConfirmButtonBg = () => {
        switch (type) {
            case 'danger':
                return '#ef4444';
            case 'warning':
                return '#f59e0b';
            default:
                return '#3b82f6';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.overlay}
                    onClick={onCancel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <button
                            className={styles.closeButton}
                            type="button"
                            onClick={onCancel}
                            aria-label="Close"
                        >
                            ×
                        </button>

                        <div className={styles.iconContainer}>
                            <div
                                className={styles.iconWrapper}
                                style={{ background: getIconBg() }}
                            >
                                {getIcon()}
                            </div>
                        </div>

                        <div className={styles.messageContainer}>
                            {messageLines.map((line, index) => (
                                <p
                                    key={index}
                                    className={index === 0 ? styles.title : styles.description}
                                >
                                    {line}
                                </p>
                            ))}
                        </div>

                        <div className={styles.buttonContainer}>
                            <motion.button
                                className={`${styles.button} ${styles.buttonCancel}`}
                                onClick={onCancel}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {cancelText}
                            </motion.button>
                            <motion.button
                                className={`${styles.button} ${styles.buttonConfirm}`}
                                onClick={onConfirm}
                                style={{
                                    background: getConfirmButtonBg(),
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {confirmText}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
