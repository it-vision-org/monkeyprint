'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadImageToR2 } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function createTicket(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) return { error: "User not found" };

    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;
    const priority = formData.get('priority') as string || 'NORMAL';
    const imageFile = formData.get('image') as File | null;

    if (!subject || !content) {
        return { error: "Subject and content are required" };
    }

    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
        try {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${imageFile.type};base64,${base64}`;
            imageUrl = await uploadImageToR2(dataUrl, 'support');
        } catch (error) {
            console.error('Error uploading image:', error);
            // Continue without image if upload fails
        }
    }

    try {
        const ticket = await prisma.supportTicket.create({
            data: {
                subject,
                priority,
                userId: user.id,
                messages: {
                    create: {
                        content,
                        imageUrl,
                        isAdmin: false
                    }
                }
            }
        });

        revalidatePath('/dashboard/support');
        return { success: true, ticketId: ticket.id };
    } catch (error) {
        console.error('Error creating ticket:', error);
        return { error: 'Failed to create ticket' };
    }
}

export async function addMessage(ticketId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) return { error: "User not found" };

    const content = formData.get('content') as string;
    const imageFile = formData.get('image') as File | null;

    if (!content) {
        return { error: "Message content is required" };
    }

    // Verify ticket belongs to user
    const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId }
    });

    if (!ticket || ticket.userId !== user.id) {
        return { error: "Ticket not found or unauthorized" };
    }

    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
        try {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${imageFile.type};base64,${base64}`;
            imageUrl = await uploadImageToR2(dataUrl, 'support');
        } catch (error) {
            console.error('Error uploading image:', error);
            // Continue without image if upload fails
        }
    }

    try {
        await prisma.supportTicketMessage.create({
            data: {
                ticketId,
                content,
                imageUrl,
                isAdmin: false,
                isRead: true, // Auto-mark read if user sends
            }
        });

        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status: 'OPEN', updatedAt: new Date() }
        });

        revalidatePath('/dashboard/support');
        revalidatePath(`/dashboard/support/${ticketId}`);
        return { success: true };
    } catch (error) {
        console.error('Error adding message:', error);
        return { error: 'Failed to add message' };
    }
}

export async function markMessagesAsRead(ticketId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    try {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email as string }
        });
        if (!user) return { error: "User not found" };

        // Verify ticket
        const ticket = await prisma.supportTicket.findUnique({
            where: { id: ticketId }
        });
        if (!ticket || ticket.userId !== user.id) {
            return { error: "Unauthorized" };
        }

        await prisma.supportTicketMessage.updateMany({
            where: {
                ticketId,
                isAdmin: true,
                isRead: false
            },
            data: { isRead: true }
        });
        revalidatePath('/dashboard/support');
        revalidatePath(`/dashboard/support/${ticketId}`);
        return { success: true };
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return { error: 'Failed to update read status' };
    }
}
