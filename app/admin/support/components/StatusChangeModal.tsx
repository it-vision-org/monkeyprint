'use client';

import { useState, useEffect } from 'react';
import { updateTicketStatus } from '../actions';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/components';

interface StatusChangeModalProps {
    ticketId: string;
    currentStatus: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function StatusChangeModal({
    ticketId,
    currentStatus,
    isOpen,
    onClose
}: StatusChangeModalProps) {
    const router = useRouter();
    const { showAlert } = useAlert();
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);

    useEffect(() => {
        setSelectedStatus(currentStatus);
    }, [currentStatus, isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'OPEN':
                return { label: 'Ouvert', color: '#f59e0b', emoji: '🔓', bgColor: '#fef3c7' };
            case 'IN_PROGRESS':
                return { label: 'En cours', color: '#3b82f6', emoji: '⚙️', bgColor: '#dbeafe' };
            case 'RESOLVED':
                return { label: 'Résolu', color: '#10b981', emoji: '✅', bgColor: '#d1fae5' };
            case 'CLOSED':
                return { label: 'Fermé', color: '#6b7280', emoji: '🔒', bgColor: '#f3f4f6' };
            default:
                return { label: status, color: '#6b7280', emoji: '❓', bgColor: '#f3f4f6' };
        }
    };

    const allStatuses = [
        { value: 'OPEN', label: 'Ouvert', emoji: '🔓' },
        { value: 'IN_PROGRESS', label: 'En cours', emoji: '⚙️' },
        { value: 'RESOLVED', label: 'Résolu', emoji: '✅' },
        { value: 'CLOSED', label: 'Fermé', emoji: '🔒' },
    ];

    const handleSave = async () => {
        if (selectedStatus === currentStatus) {
            onClose();
            return;
        }

        setIsUpdating(true);

        const result = await updateTicketStatus(ticketId, selectedStatus);

        setIsUpdating(false);

        if (result?.success) {
            showAlert("Statut mis à jour", 'success');
            onClose();
            router.refresh();
        } else {
            showAlert(result?.error || "Erreur lors de la mise à jour", 'error');
        }
    };

    if (!isOpen) return null;

    const currentStatusConfig = getStatusConfig(currentStatus);

    return (
        <div
            className="admin-status-modal-overlay"
            onClick={(e) => {
                if (!isUpdating && e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="admin-status-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="admin-status-modal-close"
                    onClick={onClose}
                    disabled={isUpdating}
                >
                    ×
                </button>

                <h2 className="admin-status-modal-title">
                    Changer le statut
                </h2>

                <p className="admin-status-modal-subtitle">
                    Statut actuel: <strong style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        backgroundColor: currentStatusConfig.bgColor,
                        color: currentStatusConfig.color,
                    }}>
                        {currentStatusConfig.emoji} {currentStatusConfig.label}
                    </strong>
                </p>

                <div className="admin-status-modal-content">
                    <div className="admin-status-modal-options-grid">
                        {allStatuses.map((status) => {
                            const config = getStatusConfig(status.value);
                            const isSelected = selectedStatus === status.value;
                            return (
                                <button
                                    key={status.value}
                                    onClick={() => setSelectedStatus(status.value)}
                                    disabled={isUpdating}
                                    className="admin-status-modal-option-card"
                                    style={{
                                        borderColor: isSelected ? config.color : '#e5e7eb',
                                        backgroundColor: isSelected ? config.bgColor : 'white',
                                        borderWidth: isSelected ? '2px' : '1px',
                                    }}
                                >
                                    <span style={{ fontSize: '20px', marginBottom: '4px' }}>{status.emoji}</span>
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: isSelected ? config.color : '#374151'
                                    }}>
                                        {status.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="admin-status-modal-actions">
                    <button
                        className="admin-status-modal-cancel"
                        onClick={onClose}
                        disabled={isUpdating}
                    >
                        Annuler
                    </button>
                    <button
                        className="admin-status-modal-save"
                        onClick={handleSave}
                        disabled={isUpdating || selectedStatus === currentStatus}
                    >
                        {isUpdating ? 'Mise à jour...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    );
}
