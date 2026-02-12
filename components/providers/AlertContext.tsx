'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AlertModal from '../ui/AlertModal';
import ConfirmModal from '../ui/ConfirmModal';

type AlertType = 'info' | 'success' | 'error' | 'warning';
type ConfirmType = 'danger' | 'warning' | 'info';

interface AlertContextType {
    showAlert: (message: string, type?: AlertType) => void;
    confirm: (message: string, type?: ConfirmType, confirmText?: string, cancelText?: string) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<AlertType>('info');

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmType, setConfirmType] = useState<ConfirmType>('warning');
    const [confirmText, setConfirmText] = useState('Confirmer');
    const [cancelText, setCancelText] = useState('Annuler');
    const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);

    const showAlert = useCallback((msg: string, alertType: AlertType = 'info') => {
        setAlertMessage(msg);
        setAlertType(alertType);
        setIsAlertOpen(true);
    }, []);

    const handleAlertClose = useCallback(() => {
        setIsAlertOpen(false);
    }, []);

    const confirm = useCallback((
        msg: string,
        confirmType: ConfirmType = 'warning',
        confirmButtonText: string = 'Confirmer',
        cancelButtonText: string = 'Annuler'
    ): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirmMessage(msg);
            setConfirmType(confirmType);
            setConfirmText(confirmButtonText);
            setCancelText(cancelButtonText);
            setConfirmResolver(() => resolve);
            setIsConfirmOpen(true);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setIsConfirmOpen(false);
        if (confirmResolver) {
            confirmResolver(true);
            setConfirmResolver(null);
        }
    }, [confirmResolver]);

    const handleCancel = useCallback(() => {
        setIsConfirmOpen(false);
        if (confirmResolver) {
            confirmResolver(false);
            setConfirmResolver(null);
        }
    }, [confirmResolver]);

    return (
        <AlertContext.Provider value={{ showAlert, confirm }}>
            {children}
            <AlertModal
                isOpen={isAlertOpen}
                message={alertMessage}
                onClose={handleAlertClose}
                type={alertType}
            />
            <ConfirmModal
                isOpen={isConfirmOpen}
                message={confirmMessage}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                confirmText={confirmText}
                cancelText={cancelText}
                type={confirmType}
            />
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
}
