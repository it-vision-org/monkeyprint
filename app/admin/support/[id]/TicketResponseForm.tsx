'use client';

import { useState } from "react";
import { respondToTicket } from "../actions";
import { useRouter } from "next/navigation";
import { useAlert } from '@/components';
import ImageUploadZone from '../../../dashboard/support/components/ImageUploadZone';
import StatusChangeModal from '../components/StatusChangeModal';

export default function TicketResponseForm({ ticketId, currentStatus }: { ticketId: string, currentStatus: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const router = useRouter();
    const { showAlert } = useAlert();

    const handleImageSelect = (file: File) => {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleImageRemove = () => {
        setSelectedImage(null);
        setImageFile(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Create FormData manually to avoid issues with hidden file inputs
        const form = e.currentTarget;
        const formData = new FormData();

        // Add text content
        const content = (form.querySelector('[name="content"]') as HTMLTextAreaElement)?.value;
        if (content) {
            formData.append('content', content);
        }

        // Add status
        const statusInput = form.querySelector('[name="status"]') as HTMLInputElement;
        if (statusInput?.value) {
            formData.append('status', statusInput.value);
        }

        // Add image file if present
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            formData.append('image', imageFile);
        }

        const result = await respondToTicket(ticketId, formData);

        setIsSubmitting(false);

        if (result?.success) {
            showAlert("Réponse envoyée", 'success');
            form.reset();
            setSelectedImage(null);
            setImageFile(null);
            router.refresh();
        } else {
            showAlert(result?.error || "Erreur lors de l'envoi de la réponse", 'error');
        }
    };

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

    const currentStatusConfig = getStatusConfig(currentStatus);

    return (
        <>
            <div className="support-message-form-container">
                <div className="support-status-actions">
                    <label>Statut actuel:</label>
                    <button
                        type="button"
                        onClick={() => setIsStatusModalOpen(true)}
                        className="support-status-change-btn"
                        style={{
                            padding: '10px 18px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            backgroundColor: currentStatusConfig.bgColor,
                            color: currentStatusConfig.color,
                            border: `2px solid ${currentStatusConfig.color}`,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>{currentStatusConfig.emoji}</span>
                        <span>{currentStatusConfig.label}</span>
                        <span style={{ fontSize: '12px', marginLeft: '4px' }}>✎</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="support-message-form">
                    <textarea
                        name="content"
                        required
                        className="support-textarea"
                        rows={6}
                        placeholder="Tapez votre réponse..."
                    />
                    <ImageUploadZone
                        id="response-image"
                        label="Ajouter une image (optionnel)"
                        onImageSelect={handleImageSelect}
                        onImageRemove={handleImageRemove}
                        selectedImage={selectedImage}
                        imageFile={imageFile}
                    />
                    <input type="hidden" name="status" value={currentStatus} />
                    <button
                        type="submit"
                        className="support-btn support-btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Envoi...' : 'Envoyer la réponse'}
                    </button>
                </form>
            </div>

            <StatusChangeModal
                ticketId={ticketId}
                currentStatus={currentStatus}
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
            />
        </>
    );
}
