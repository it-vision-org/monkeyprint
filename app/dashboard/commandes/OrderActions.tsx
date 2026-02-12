'use client';

import { confirmOrder, deleteOrder } from "./actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from '@/components';
import { motion } from "framer-motion";
import { iconButtonVariants } from "@/lib/interactions";

export default function OrderActions({ orderId, status, deletionRequested }: { orderId: string, status: string, deletionRequested?: boolean }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { showAlert, confirm } = useAlert();

    const handleConfirm = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const confirmed = await confirm('Confirmer cette commande ?', 'info');
        if (!confirmed) return;
        setLoading(true);
        await confirmOrder(orderId);
        setLoading(false);
        router.refresh();
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Different confirmation message based on order status
        const isPending = status === 'PENDING';
        const confirmMessage = isPending
            ? 'Supprimer définitivement cette commande ?\n\nCette action est irréversible.'
            : 'Demander la suppression de cette commande ?\n\nCeci est une demande de suppression. La requête a été envoyée et est en cours de traitement.';

        const confirmed = await confirm(confirmMessage, isPending ? 'danger' : 'warning');
        if (!confirmed) return;
        setLoading(true);
        const result = await deleteOrder(orderId);
        setLoading(false);
        if (result?.success) {
            const successMessage = isPending
                ? 'Commande supprimée avec succès.'
                : 'Demande de suppression envoyée avec succès.\n\nVotre requête est en cours de traitement.';
            showAlert(successMessage, 'success');
            router.refresh();
        }
    };

    if (loading) return <div style={{ fontSize: '12px', color: '#666' }}>...</div>;

    // Don't show delete button if deletion is already requested (badge is shown on the left)
    if (deletionRequested) {
        return null;
    }

    return (
        <div
            className="commande-actions"
            onClick={(e) => e.stopPropagation()}
        >
            <motion.button
                variants={iconButtonVariants}
                whileHover="hover"
                whileTap="tap"
                className="commande-delete-btn"
                onClick={handleDelete}
                title="Demander la suppression"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </motion.button>
            {status === 'PENDING' && (
                <motion.button
                    variants={iconButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className={`commande-check-btn`}
                    onClick={handleConfirm}
                    title="Confirmer"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </motion.button>
            )}
        </div>
    );
}
