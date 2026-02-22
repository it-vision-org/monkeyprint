'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { updateProduct } from '../../actions';
import styles from '../../../../styles/produits.module.css';

interface EditProductFormProps {
    product: {
        id: string;
        name: string;
        description: string | null;
        basePrice: number;
        type: string;
        previewFront: string | null;
    };
    imageUrl: string | null;
}

export default function EditProductForm({ product, imageUrl }: EditProductFormProps) {
    const router = useRouter();
    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description || '');
    const [price, setPrice] = useState(product.basePrice.toString());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);

            const result = await updateProduct(product.id, formData);

            if (result?.error) {
                setError(result.error);
                setIsSubmitting(false);
            } else {
                router.push('/dashboard/produits');
                router.refresh();
            }
        } catch (e) {
            console.error('Update error:', e);
            setError('Une erreur est survenue');
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.editFormContainer}>
            <form onSubmit={handleSubmit}>
                <div className={styles.editFormGrid}>
                    {/* Product Image */}
                    <div>
                        <h3 className={styles.sectionTitle}>Image du produit</h3>
                        <div className={styles.imagePreview}>
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={product.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            ) : (
                                <span style={{ color: '#9ca3af' }}>Aucune image</span>
                            )}
                        </div>
                        <p style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
                            Type: {product.type}
                        </p>
                    </div>

                    {/* Product Details */}
                    <div>
                        <div className={styles.formGroup}>
                            <label className={styles.inputLabel}>
                                Nom du produit <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                className={styles.formInput}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.inputLabel}>
                                Prix (DT) <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className={styles.formInput}
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.inputLabel}>
                                Description
                            </label>
                            <textarea
                                className={`${styles.formInput} ${styles.formTextarea}`}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6}
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className={styles.errorBox}>
                        {error}
                    </div>
                )}

                <div className={styles.formActions}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        className={styles.btnSecondary}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.btnPrimary}
                    >
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
}

