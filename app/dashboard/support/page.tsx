import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import CreateTicketForm from "./CreateTicketForm";

export default async function SupportPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) redirect("/");

    const tickets = await prisma.supportTicket.findMany({
        where: { userId: user.id },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

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

    return (
        <div className="support-page">
            <div className="support-header">
                <h1 className="dash-page-title">Support</h1>
                <CreateTicketForm />
            </div>

            <div className="support-tickets-list">
                {tickets.length === 0 ? (
                    <div className="support-empty">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>Aucun ticket de support</p>
                        <p className="support-empty-subtitle">Créez un nouveau ticket pour obtenir de l'aide</p>
                    </div>
                ) : (
                    tickets.map((ticket: typeof tickets[number]) => {
                        const lastMessage = ticket.messages[ticket.messages.length - 1];
                        const unreadCount = ticket.messages.filter((m: typeof ticket.messages[number]) => m.isAdmin && !m.createdAt).length; // Simplified - you might want to track read status

                        return (
                            <Link 
                                key={ticket.id} 
                                href={`/dashboard/support/${ticket.id}`}
                                className="support-ticket-card"
                            >
                                <div className="support-ticket-header">
                                    <div className="support-ticket-title-row">
                                        <h3 className="support-ticket-subject">{ticket.subject}</h3>
                                        {unreadCount > 0 && (
                                            <span className="support-ticket-badge">{unreadCount}</span>
                                        )}
                                    </div>
                                    <div className="support-ticket-meta">
                                        {(() => {
                                            const statusConfig = getStatusConfig(ticket.status);
                                            return (
                                                <span 
                                                    className="support-ticket-status"
                                                    style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                                                >
                                                    <span style={{ marginRight: '4px' }}>{statusConfig.emoji}</span>
                                                    {statusConfig.label}
                                                </span>
                                            );
                                        })()}
                                        <span 
                                            className="support-ticket-priority"
                                            style={{ backgroundColor: getPriorityColor(ticket.priority) + '20', color: getPriorityColor(ticket.priority) }}
                                        >
                                            {getPriorityLabel(ticket.priority)}
                                        </span>
                                    </div>
                                </div>
                                {lastMessage && (
                                    <div className="support-ticket-preview">
                                        <p className="support-ticket-preview-text">
                                            {lastMessage.content.length > 150 
                                                ? lastMessage.content.substring(0, 150) + '...' 
                                                : lastMessage.content}
                                        </p>
                                        <span className="support-ticket-date">
                                            {format(ticket.updatedAt, "dd/MM/yyyy HH:mm")}
                                        </span>
                                    </div>
                                )}
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
