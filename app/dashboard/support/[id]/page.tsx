import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import TicketMessageForm from "./TicketMessageForm";
import { getR2Url } from "@/lib/storage";
import Image from "next/image";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.email) redirect("/");

    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) redirect("/");

    const ticket = await prisma.supportTicket.findUnique({
        where: { id },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' }
            },
            user: true
        }
    });

    if (!ticket || ticket.userId !== user.id) {
        redirect("/dashboard/support");
    }

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
        <div className="support-detail-page">
            <div className="support-detail-header">
                <Link href="/dashboard/support" className="support-back-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Retour aux tickets
                </Link>
                <h1 className="dash-page-title">{ticket.subject}</h1>
                <div className="support-detail-meta">
                    {(() => {
                        const statusConfig = getStatusConfig(ticket.status);
                        return (
                            <span 
                                className="support-ticket-status"
                                style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                            >
                                <span style={{ marginRight: '6px' }}>{statusConfig.emoji}</span>
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
                    <span className="support-detail-date">
                        Créé le {format(ticket.createdAt, "dd/MM/yyyy à HH:mm")}
                    </span>
                </div>
            </div>

            <div className="support-messages">
                {(await Promise.all(ticket.messages.map(async (message) => {
                    const imageUrl = message.imageUrl ? await getR2Url(message.imageUrl) : null;
                    return { message, imageUrl };
                }))).map(({ message, imageUrl }) => (
                    <div 
                        key={message.id} 
                        className={`support-message ${message.isAdmin ? 'support-message-admin' : 'support-message-user'}`}
                    >
                        <div className="support-message-header">
                            <div className="support-message-author-badge">
                                {message.isAdmin ? (
                                    <>
                                        <span className="support-message-icon">👨‍💼</span>
                                        <span className="support-message-author-label">Support</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="support-message-icon">👤</span>
                                        <span className="support-message-author-label">Vous</span>
                                    </>
                                )}
                            </div>
                            <span className="support-message-date">
                                {format(message.createdAt, "dd/MM/yyyy à HH:mm")}
                            </span>
                        </div>
                        <div className="support-message-content">
                            {message.content.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                        {imageUrl && (
                            <div className="support-message-image">
                                <Image 
                                    src={imageUrl} 
                                    alt="Attachment" 
                                    width={400} 
                                    height={400}
                                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <TicketMessageForm ticketId={ticket.id} />
        </div>
    );
}
