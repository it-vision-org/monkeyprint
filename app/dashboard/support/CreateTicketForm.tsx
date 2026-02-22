'use client';

import { useState } from "react";
import { createTicket } from "./actions";
import { useRouter } from "next/navigation";
import { useAlert } from '@/components';
import ImageUploadZone from './components/ImageUploadZone';
import styles from "../../styles/support.module.css";

export default function CreateTicketForm() {
    const [isOpen, setIsOpen] = useState(false);
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

        // Add form fields
        const subject = (form.querySelector('[name="subject"]') as HTMLInputElement)?.value;
        const content = (form.querySelector('[name="content"]') as HTMLTextAreaElement)?.value;
        const priority = (form.querySelector('[name="priority"]') as HTMLSelectElement)?.value || 'NORMAL';

        if (subject) formData.append('subject', subject);
        if (content) formData.append('content', content);
        if (priority) formData.append('priority', priority);

        // Add image file if present
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            formData.append('image', imageFile);
        }

        const result = await createTicket(formData);

        setIsSubmitting(false);

        if (result?.success) {
            showAlert("Ticket créé avec succès", 'success');
            setIsOpen(false);
            form.reset();
            setSelectedImage(null);
            setImageFile(null);
            router.refresh();
        } else {
            showAlert(result?.error || "Erreur lors de la création du ticket", 'error');
        }
    };

    if (!isOpen) {
        return (
            <button
                className={`${styles.supportBtn} ${styles.supportBtnPrimary}`}
                onClick={() => setIsOpen(true)}
                aria-label="Créer un ticket"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Créer un ticket
            </button>
        );
    }

    return (
        <div className={styles.supportCreateModal}>
            <div className={styles.supportCreateModalOverlay} onClick={() => setIsOpen(false)}></div>
            <div className={styles.supportCreateModalContent}>
                <div className={styles.supportCreateModalHeader}>
                    <h2>Nouveau ticket de support</h2>
                    <button
                        className={styles.supportCreateModalClose}
                        onClick={() => setIsOpen(false)}
                        aria-label="Fermer"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className={styles.supportCreateForm}>
                    <div className={styles.supportFormGroup}>
                        <label htmlFor="subject">Sujet *</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            required
                            className={styles.supportInput}
                            placeholder="Résumé de votre problème..."
                        />
                    </div>
                    <div className={styles.supportFormGroup}>
                        <label htmlFor="priority">Priorité</label>
                        <select
                            id="priority"
                            name="priority"
                            className={styles.supportInput}
                            defaultValue="NORMAL"
                        >
                            <option value="LOW">Basse</option>
                            <option value="NORMAL">Normale</option>
                            <option value="HIGH">Élevée</option>
                            <option value="URGENT">Urgente</option>
                        </select>
                    </div>
                    <div className={styles.supportFormGroup}>
                        <label htmlFor="content">Message *</label>
                        <textarea
                            id="content"
                            name="content"
                            required
                            className={styles.supportTextarea}
                            rows={6}
                            placeholder="Décrivez votre problème en détail..."
                        />
                    </div>
                    <ImageUploadZone
                        id="image"
                        label="Image (optionnel)"
                        onImageSelect={handleImageSelect}
                        onImageRemove={handleImageRemove}
                        selectedImage={selectedImage}
                        imageFile={imageFile}
                    />
                    <div className={styles.supportFormActions}>
                        <button
                            type="button"
                            className={`${styles.supportBtn} ${styles.supportBtnSecondary}`}
                            onClick={() => setIsOpen(false)}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className={`${styles.supportBtn} ${styles.supportBtnPrimary}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Création...' : 'Créer le ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
