'use client';

import { useEffect } from 'react';

type AlertModalProps = {
    isOpen: boolean;
    message: string;
    onClose: () => void;
    type?: 'info' | 'success' | 'error' | 'warning';
};

export default function AlertModal({ isOpen, message, onClose, type = 'info' }: AlertModalProps) {
    useEffect(() => {
        if (isOpen) {
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Handle multi-line messages (split by \n)
    const messageLines = message.split('\n');

    // Icon based on type
    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                );
            case 'error':
                return (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
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
            case 'success':
                return 'linear-gradient(135deg, #41eb5c 0%, #35d04a 100%)';
            case 'error':
                return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            case 'warning':
                return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            default:
                return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
        }
    };

    return (
        <div
            className="alert-modal-overlay"
            onClick={onClose}
        >
            <div
                className="alert-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="alert-modal-close"
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
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

                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
                    <button
                        className="alert-modal-button"
                        onClick={onClose}
                        style={{
                            background: type === 'success'
                                ? '#41eb5c'
                                : type === 'error'
                                    ? '#ef4444'
                                    : type === 'warning'
                                        ? '#f59e0b'
                                        : '#3b82f6',
                            color: '#ffffff',
                        }}
                    >
                        D'accord
                    </button>
                </div>
            </div>
        </div>
    );
}
