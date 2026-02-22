import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import CreateTicketForm from "./CreateTicketForm";
import styles from "../../styles/support.module.css";

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
        <div className={styles.supportPage}>
            <div className={styles.supportHeader}>
                <h1 className={styles.pageTitle} style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>Support</h1>
                <CreateTicketForm />
            </div>

            <div className={styles.supportTicketsList}>
                {tickets.length === 0 ? (
                    <div className={styles.supportEmpty}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>Aucun ticket de support</p>
                        <p className={styles.supportEmptySubtitle}>Créez un nouveau ticket pour obtenir de l'aide</p>
                    </div>
                ) : (
                    tickets.map((ticket: typeof tickets[number]) => {
                        const lastMessage = ticket.messages[ticket.messages.length - 1];
                        const unreadCount = ticket.messages.filter((m: any) => m.isAdmin && !m.isRead).length;

                        return (
                            <Link
                                key={ticket.id}
                                href={`/dashboard/support/${ticket.id}`}
                                className={styles.supportTicketCard}
                            >
                                <div className={styles.supportTicketHeader}>
                                    <div className={styles.supportTicketTitleRow}>
                                        <h3 className={styles.supportTicketSubject} style={{ flex: 1 }}>{ticket.subject}</h3>
                                        {unreadCount > 0 && (
                                            <span className={styles.supportTicketBadge}>{unreadCount} Nouveau{unreadCount > 1 ? 'x' : ''}</span>
                                        )}
                                    </div>
                                    <div className={styles.supportTicketMeta}>
                                        {(() => {
                                            const statusConfig = getStatusConfig(ticket.status);
                                            return (
                                                <span
                                                    className={styles.supportTicketStatus}
                                                    style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                                                >
                                                    <span style={{ marginRight: '4px' }}>{statusConfig.emoji}</span>
                                                    {statusConfig.label}
                                                </span>
                                            );
                                        })()}
                                        <span
                                            className={styles.supportTicketPriority}
                                            style={{ backgroundColor: getPriorityColor(ticket.priority) + '20', color: getPriorityColor(ticket.priority) }}
                                        >
                                            {getPriorityLabel(ticket.priority)}
                                        </span>
                                    </div>
                                </div>
                                {lastMessage && (
                                    <div className={styles.supportTicketPreview}>
                                        <p className={styles.supportTicketPreviewText}>
                                            {lastMessage.content.length > 150
                                                ? lastMessage.content.substring(0, 150) + '...'
                                                : lastMessage.content}
                                        </p>
                                        <span className={styles.supportTicketDate}>
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
