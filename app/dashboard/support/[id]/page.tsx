import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import TicketMessageForm from "./TicketMessageForm";
import { getR2Url } from "@/lib/storage";
import Image from "next/image";
import styles from "../../../styles/support.module.css";

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

    // Mark any unread admin messages as read since the user is viewing the ticket
    const hasUnread = ticket.messages.some(m => m.isAdmin && !m.isRead);
    if (hasUnread) {
        await prisma.supportTicketMessage.updateMany({
            where: {
                ticketId: id,
                isAdmin: true,
                isRead: false
            },
            data: { isRead: true }
        });
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
        <div className={styles.supportDetailPage}>
            <div className={styles.supportDetailHeader}>
                <Link href="/dashboard/support" className={styles.supportBackLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Retour aux tickets
                </Link>
                <h1 className={styles.pageTitle} style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>{ticket.subject}</h1>
                <div className={styles.supportDetailMeta}>
                    {(() => {
                        const statusConfig = getStatusConfig(ticket.status);
                        return (
                            <span
                                className={styles.supportTicketStatus}
                                style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                            >
                                <span style={{ marginRight: '6px' }}>{statusConfig.emoji}</span>
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
                    <span className={styles.supportDetailDate}>
                        Créé le {format(ticket.createdAt, "dd/MM/yyyy à HH:mm")}
                    </span>
                </div>
            </div>

            <div className={styles.supportMessages}>
                {(await Promise.all(ticket.messages.map(async (message: typeof ticket.messages[number]) => {
                    const imageUrl = message.imageUrl ? await getR2Url(message.imageUrl) : null;
                    return { message, imageUrl };
                }))).map(({ message, imageUrl }) => (
                    <div
                        key={message.id}
                        className={`${styles.supportMessage} ${message.isAdmin ? styles.supportMessageAdmin : styles.supportMessageUser}`}
                    >
                        <div className={styles.supportMessageHeader}>
                            <div className={styles.supportMessageAuthorBadge}>
                                {message.isAdmin ? (
                                    <>
                                        <span className={styles.supportMessageIcon}>👨‍💼</span>
                                        <span className={styles.supportMessageAuthorLabel}>Support</span>
                                    </>
                                ) : (
                                    <>
                                        <span className={styles.supportMessageIcon}>👤</span>
                                        <span className={styles.supportMessageAuthorLabel}>Vous</span>
                                    </>
                                )}
                            </div>
                            <span className={styles.supportMessageDate}>
                                {format(message.createdAt, "dd/MM/yyyy à HH:mm")}
                            </span>
                        </div>
                        <div className={styles.supportMessageContent}>
                            {message.content.split('\n').map((line: string, i: number) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                        {imageUrl && (
                            <div className={styles.supportMessageImage}>
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
