'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { updateProduct } from '../../actions';

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
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 0' }}>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                    {/* Product Image */}
                    <div>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>Image du produit</h3>
                        {imageUrl ? (
                            <div style={{ 
                                width: '100%', 
                                aspectRatio: '1', 
                                background: '#f3f4f6', 
                                borderRadius: '12px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img 
                                    src={imageUrl} 
                                    alt={product.name}
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'contain' 
                                    }}
                                />
                            </div>
                        ) : (
                            <div style={{ 
                                width: '100%', 
                                aspectRatio: '1', 
                                background: '#f3f4f6', 
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#9ca3af'
                            }}>
                                Aucune image
                            </div>
                        )}
                        <p style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
                            Type: {product.type}
                        </p>
                    </div>

                    {/* Product Details */}
                    <div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontSize: '14px', 
                                fontWeight: 600,
                                color: '#374151'
                            }}>
                                Nom du produit <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontSize: '14px', 
                                fontWeight: 600,
                                color: '#374151'
                            }}>
                                Prix (DT) <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontSize: '14px', 
                                fontWeight: 600,
                                color: '#374151'
                            }}>
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div style={{ 
                        padding: '12px 16px', 
                        background: '#fee2e2', 
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        color: '#dc2626',
                        marginBottom: '24px'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        style={{
                            padding: '12px 24px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            background: 'white',
                            color: '#374151',
                            fontSize: '16px',
                            fontWeight: 500,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            opacity: isSubmitting ? 0.5 : 1
                        }}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '8px',
                            background: '#2563eb',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: 500,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            opacity: isSubmitting ? 0.5 : 1
                        }}
                    >
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
}

