'use client';

import { useState } from 'react';
import { MainHeader, type MenuItem } from '@/components';

const contactMenuItems: MenuItem[] = [
    { label: "Accueil", href: "/", icon: "🏠" },
    { label: "Découvrez les boutiques", href: "/stores", icon: "🔥" },
    { label: "Contactez-nous", href: "/contact", icon: "💬" },
];

import { Suspense } from 'react';

// Wrap MainHeader in a separate component to manage its suspense requirements
function ContactHeader({ menuItems }: { menuItems: MenuItem[] }) {
    return <MainHeader menuItems={menuItems} />;
}

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

    const validateForm = () => {
        const nextErrors: Partial<Record<keyof typeof formData, string>> = {};
        if (!formData.name.trim()) nextErrors.name = "Le nom est requis.";
        if (!formData.email.trim()) {
            nextErrors.email = "L'email est requis.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            nextErrors.email = "Veuillez entrer un email valide.";
        }
        if (!formData.subject) nextErrors.subject = "Veuillez sélectionner un sujet.";
        if (!formData.message.trim()) {
            nextErrors.message = "Le message est requis.";
        } else if (formData.message.trim().length < 10) {
            nextErrors.message = "Le message doit contenir au moins 10 caractères.";
        }
        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (fieldErrors[e.target.name as keyof typeof formData]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            setSubmitMessage({
                type: 'error',
                text: 'Veuillez corriger les champs en erreur avant d\'envoyer.'
            });
            return;
        }
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
        <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
            <Suspense fallback={<div style={{ height: '80px', background: 'white' }} />}>
                <ContactHeader menuItems={contactMenuItems} />
            </Suspense>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
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
                            <label htmlFor="contact-name" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#374151'
                            }}>
                                Nom complet
                            </label>
                            <input
                                id="contact-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                aria-invalid={!!fieldErrors.name}
                                aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: fieldErrors.name ? '1px solid #dc2626' : '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                            {fieldErrors.name && <p id="contact-name-error" style={{ margin: '8px 0 0', color: '#b91c1c', fontSize: '13px' }}>{fieldErrors.name}</p>}
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label htmlFor="contact-email" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#374151'
                            }}>
                                Email
                            </label>
                            <input
                                id="contact-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                aria-invalid={!!fieldErrors.email}
                                aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: fieldErrors.email ? '1px solid #dc2626' : '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                            {fieldErrors.email && <p id="contact-email-error" style={{ margin: '8px 0 0', color: '#b91c1c', fontSize: '13px' }}>{fieldErrors.email}</p>}
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label htmlFor="contact-subject" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#374151'
                            }}>
                                Sujet
                            </label>
                            <select
                                id="contact-subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                aria-invalid={!!fieldErrors.subject}
                                aria-describedby={fieldErrors.subject ? 'contact-subject-error' : undefined}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: fieldErrors.subject ? '1px solid #dc2626' : '1px solid #d1d5db',
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
                            {fieldErrors.subject && <p id="contact-subject-error" style={{ margin: '8px 0 0', color: '#b91c1c', fontSize: '13px' }}>{fieldErrors.subject}</p>}
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label htmlFor="contact-message" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#374151'
                            }}>
                                Message
                            </label>
                            <textarea
                                id="contact-message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={6}
                                aria-invalid={!!fieldErrors.message}
                                aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: fieldErrors.message ? '1px solid #dc2626' : '1px solid #d1d5db',
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
                            {fieldErrors.message && <p id="contact-message-error" style={{ margin: '8px 0 0', color: '#b91c1c', fontSize: '13px' }}>{fieldErrors.message}</p>}
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

