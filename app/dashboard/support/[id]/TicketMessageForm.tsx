'use client';

import { useState } from "react";
import { addMessage } from "../actions";
import { useRouter } from "next/navigation";
import { useAlert } from '@/components';
import ImageUploadZone from '../components/ImageUploadZone';
import styles from "../../../styles/support.module.css";

export default function TicketMessageForm({ ticketId }: { ticketId: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
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

        // Add image file if present
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            formData.append('image', imageFile);
        }

        const result = await addMessage(ticketId, formData);

        setIsSubmitting(false);

        if (result?.success) {
            showAlert("Message envoyé", 'success');
            form.reset();
            setSelectedImage(null);
            setImageFile(null);
            router.refresh();
        } else {
            showAlert(result?.error || "Erreur lors de l'envoi du message", 'error');
        }
    };

    return (
        <div className={styles.messageFormCard}>
            <h3 className={styles.messageFormTitle}>Répondre au ticket</h3>
            <form onSubmit={handleSubmit} className={styles.supportCreateForm}>
                <textarea
                    name="content"
                    required
                    className={styles.supportTextarea}
                    rows={4}
                    placeholder="Tapez votre message..."
                />
                <ImageUploadZone
                    id="message-image"
                    label="Ajouter une image (optionnel)"
                    onImageSelect={handleImageSelect}
                    onImageRemove={handleImageRemove}
                    selectedImage={selectedImage}
                    imageFile={imageFile}
                />
                <div className={styles.supportFormActions}>
                    <button
                        type="submit"
                        className={`${styles.supportBtn} ${styles.supportBtnPrimary}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Envoi...' : 'Envoyer'}
                    </button>
                </div>
            </form>
        </div>
    );
}
