'use client';

import { useEffect } from 'react';

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
            // Prevent body scroll when modal is open
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

    if (!isOpen) return null;

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
        <div
            className="confirm-modal-overlay"
            onClick={onCancel}
        >
            <div
                className="confirm-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="confirm-modal-close"
                    type="button"
                    onClick={onCancel}
                    aria-label="Close"
                >
                    ×
                </button>

                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: getIconBg(),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}
                    >
                        {getIcon()}
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    {messageLines.map((line, index) => (
                        <p
                            key={index}
                            style={{
                                fontSize: '17px',
                                color: '#0d1c23',
                                margin: index === 0 ? '0 0 8px 0' : '0 0 8px 0',
                                lineHeight: '1.5',
                                fontWeight: index === 0 ? 600 : 400,
                            }}
                        >
                            {line}
                        </p>
                    ))}
                </div>

                <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        className="confirm-modal-button confirm-modal-button-cancel"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="confirm-modal-button confirm-modal-button-confirm"
                        onClick={onConfirm}
                        style={{
                            background: getConfirmButtonBg(),
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
