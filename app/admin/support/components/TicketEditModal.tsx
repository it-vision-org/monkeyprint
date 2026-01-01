'use client';

import { useState, useEffect } from 'react';
import { updateTicketStatusAndPriority } from '../actions';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/components/AlertContext';

interface TicketEditModalProps {
    ticketId: string;
    currentStatus: string;
    currentPriority: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function TicketEditModal({ 
    ticketId, 
    currentStatus, 
    currentPriority, 
    isOpen, 
    onClose 
}: TicketEditModalProps) {
    const router = useRouter();
    const { showAlert } = useAlert();
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const [selectedPriority, setSelectedPriority] = useState(currentPriority);

    useEffect(() => {
        setSelectedStatus(currentStatus);
        setSelectedPriority(currentPriority);
    }, [currentStatus, currentPriority, isOpen]);

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

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'URGENT':
                return { label: 'Urgent', color: '#ef4444', bgColor: '#fee2e2' };
            case 'HIGH':
                return { label: 'Élevée', color: '#f97316', bgColor: '#fed7aa' };
            case 'NORMAL':
                return { label: 'Normale', color: '#3b82f6', bgColor: '#dbeafe' };
            case 'LOW':
                return { label: 'Basse', color: '#6b7280', bgColor: '#f3f4f6' };
            default:
                return { label: priority, color: '#6b7280', bgColor: '#f3f4f6' };
        }
    };

    const allStatuses = [
        { value: 'OPEN', label: 'Ouvert', emoji: '🔓' },
        { value: 'IN_PROGRESS', label: 'En cours', emoji: '⚙️' },
        { value: 'RESOLVED', label: 'Résolu', emoji: '✅' },
        { value: 'CLOSED', label: 'Fermé', emoji: '🔒' },
    ];

    const allPriorities = [
        { value: 'URGENT', label: 'Urgent' },
        { value: 'HIGH', label: 'Élevée' },
        { value: 'NORMAL', label: 'Normale' },
        { value: 'LOW', label: 'Basse' },
    ];

    const handleSave = async () => {
        setIsUpdating(true);
        
        const result = await updateTicketStatusAndPriority(ticketId, selectedStatus, selectedPriority);
        
        setIsUpdating(false);
        
        if (result?.success) {
            showAlert("Ticket mis à jour", 'success');
            onClose();
            router.refresh();
        } else {
            showAlert(result?.error || "Erreur lors de la mise à jour", 'error');
        }
    };

    if (!isOpen) return null;

    const currentStatusConfig = getStatusConfig(currentStatus);
    const currentPriorityConfig = getPriorityConfig(currentPriority);

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
                    Modifier le ticket
                </h2>
                
                <div className="admin-status-modal-content">
                    {/* Status Selection */}
                    <div className="admin-status-modal-section">
                        <label className="admin-status-modal-section-label">
                            Statut actuel: <span style={{ 
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 600,
                                backgroundColor: currentStatusConfig.bgColor,
                                color: currentStatusConfig.color,
                            }}>
                                {currentStatusConfig.emoji} {currentStatusConfig.label}
                            </span>
                        </label>
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

                    {/* Priority Selection */}
                    <div className="admin-status-modal-section">
                        <label className="admin-status-modal-section-label">
                            Priorité actuelle: <span style={{ 
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 600,
                                backgroundColor: currentPriorityConfig.bgColor,
                                color: currentPriorityConfig.color,
                            }}>
                                {currentPriorityConfig.label}
                            </span>
                        </label>
                        <div className="admin-status-modal-options-grid">
                            {allPriorities.map((priority) => {
                                const config = getPriorityConfig(priority.value);
                                const isSelected = selectedPriority === priority.value;
                                return (
                                    <button
                                        key={priority.value}
                                        onClick={() => setSelectedPriority(priority.value)}
                                        disabled={isUpdating}
                                        className="admin-status-modal-option-card"
                                        style={{
                                            borderColor: isSelected ? config.color : '#e5e7eb',
                                            backgroundColor: isSelected ? config.bgColor : 'white',
                                            borderWidth: isSelected ? '2px' : '1px',
                                        }}
                                    >
                                        <span style={{ 
                                            fontSize: '14px', 
                                            fontWeight: 600,
                                            color: isSelected ? config.color : '#374151'
                                        }}>
                                            {priority.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
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
                        disabled={isUpdating || (selectedStatus === currentStatus && selectedPriority === currentPriority)}
                    >
                        {isUpdating ? 'Mise à jour...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    );
}
