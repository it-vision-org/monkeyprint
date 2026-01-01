'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TicketEditModal from './components/TicketEditModal';

interface AdminSupportTableRowProps {
    ticket: {
        id: string;
        subject: string;
        status: string;
        priority: string;
        updatedAt: string | Date;
        user: { email: string };
        _count: { messages: number };
    };
}

export default function AdminSupportTableRow({ ticket }: AdminSupportTableRowProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT':
                return '#ef4444';
            case 'HIGH':
                return '#f97316';
            case 'NORMAL':
                return '#3b82f6';
            case 'LOW':
                return '#6b7280';
            default:
                return '#6b7280';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'URGENT':
                return 'Urgent';
            case 'HIGH':
                return 'Élevée';
            case 'NORMAL':
                return 'Normale';
            case 'LOW':
                return 'Basse';
            default:
                return priority;
        }
    };

    const statusConfig = getStatusConfig(ticket.status);

    return (
        <>
            <tr key={ticket.id}>
                <td>#{ticket.id.slice(0, 8)}</td>
                <td>
                    <Link 
                        href={`/admin/support/${ticket.id}`}
                        style={{ color: '#0d9488', textDecoration: 'none', fontWeight: 600 }}
                    >
                        {ticket.subject}
                    </Link>
                </td>
                <td>{ticket.user.email}</td>
                <td>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsModalOpen(true);
                        }}
                        className="admin-support-priority-badge"
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            backgroundColor: getPriorityColor(ticket.priority) + '20',
                            color: getPriorityColor(ticket.priority),
                            border: `1px solid ${getPriorityColor(ticket.priority)}40`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {getPriorityLabel(ticket.priority)}
                    </button>
                </td>
                <td>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsModalOpen(true);
                        }}
                        className="admin-support-status-badge"
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color,
                            border: `1px solid ${statusConfig.color}40`,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <span>{statusConfig.emoji}</span>
                        <span>{statusConfig.label}</span>
                    </button>
                </td>
                <td>{ticket._count.messages}</td>
                <td>{new Date(ticket.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td>
                    <Link 
                        href={`/admin/support/${ticket.id}`}
                        className="admin-link-btn"
                    >
                        Voir
                    </Link>
                </td>
            </tr>

            <TicketEditModal
                ticketId={ticket.id}
                currentStatus={ticket.status}
                currentPriority={ticket.priority}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
