'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage(null);

        // TODO: Implement actual contact form submission API
        // For now, just show success message
        setTimeout(() => {
            setSubmitMessage({
                type: 'success',
                text: 'Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.'
            });
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <header style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '16px',
                    marginBottom: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                        <Image
                            src="/logo.png"
                            alt="Monkey Print"
                            width={100}
                            height={50}
                            style={{ objectFit: 'contain' }}
                        />
                    </Link>
                </header>

                {/* Contact Form */}
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        color: '#1f2937'
                    }}>
                        Contactez-nous
                    </h1>
                    <p style={{
                        color: '#6b7280',
                        marginBottom: '32px',
                        fontSize: '16px'
                    }}>
                        Avez-vous une question ou besoin d&apos;aide ? N&apos;hésitez pas à nous contacter. Nous sommes là pour vous aider.
                    </p>

                    {submitMessage && (
                        <div style={{
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            background: submitMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
                            color: submitMessage.type === 'success' ? '#065f46' : '#991b1b',
                            fontSize: '14px',
                            fontWeight: 500
                        }}>
                            {submitMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#374151'
                            }}>
                                Nom complet
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
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
                                onFocus={(e) => e.target.style.borderColor = '#000'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
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
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
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
                                onFocus={(e) => e.target.style.borderColor = '#000'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
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
                                Sujet
                            </label>
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    background: 'white',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            >
                                <option value="">Sélectionnez un sujet</option>
                                <option value="question">Question générale</option>
                                <option value="support">Support technique</option>
                                <option value="partnership">Partenariat</option>
                                <option value="feedback">Commentaires</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#374151'
                            }}>
                                Message
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
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
                                onFocus={(e) => e.target.style.borderColor = '#000'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: isSubmitting ? '#9ca3af' : '#000',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => {
                                if (!isSubmitting) e.currentTarget.style.background = '#374151';
                            }}
                            onMouseOut={(e) => {
                                if (!isSubmitting) e.currentTarget.style.background = '#000';
                            }}
                        >
                            {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '40px',
                        paddingTop: '32px',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: 600,
                            marginBottom: '16px',
                            color: '#1f2937'
                        }}>
                            Autres moyens de nous contacter
                        </h2>
                        <div style={{ color: '#6b7280', lineHeight: '1.8' }}>
                            <p style={{ marginBottom: '8px' }}>
                                <strong>Email:</strong> contact@monkeyprint.com
                            </p>
                            <p style={{ marginBottom: '8px' }}>
                                <strong>Support:</strong> support@monkeyprint.com
                            </p>
                            <p>
                                Nous répondons généralement dans les 24 heures.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

