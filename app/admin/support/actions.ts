'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadImageToR2 } from "@/lib/storage";

export async function respondToTicket(ticketId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') return { error: "Unauthorized" };

    const content = formData.get('content') as string;
    const status = formData.get('status') as string;

    if (!content) {
        return { error: "Message content is required" };
    }

    let imageUrl = null;
    const imageFileData = formData.get('image');
    if (imageFileData && imageFileData instanceof File && imageFileData.size > 0) {
        try {
            const arrayBuffer = await imageFileData.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${imageFileData.type};base64,${base64}`;
            imageUrl = await uploadImageToR2(dataUrl, 'support');
        } catch (error) {
            console.error('Error uploading image:', error);
            return { error: 'Erreur lors du téléchargement de l\'image' };
        }
    }

    try {
        await prisma.supportTicketMessage.create({
            data: {
                ticketId,
                content,
                imageUrl,
                isAdmin: true
            }
        });

        if (status) {
            await prisma.supportTicket.update({
                where: { id: ticketId },
                data: { 
                    status,
                    updatedAt: new Date()
                }
            });
        } else {
            await prisma.supportTicket.update({
                where: { id: ticketId },
                data: { 
                    status: 'IN_PROGRESS',
                    updatedAt: new Date()
                }
            });
        }

        revalidatePath('/admin/support');
        revalidatePath(`/admin/support/${ticketId}`);
        return { success: true };
    } catch (error) {
        console.error('Error responding to ticket:', error);
        return { error: 'Failed to respond to ticket' };
    }
}

export async function updateTicketStatus(ticketId: string, status: string) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { 
                status,
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/support');
        revalidatePath(`/admin/support/${ticketId}`);
        return { success: true };
    } catch (error) {
        console.error('Error updating ticket status:', error);
        return { error: 'Failed to update ticket status' };
    }
}

export async function updateTicketPriority(ticketId: string, priority: string) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { 
                priority,
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/support');
        revalidatePath(`/admin/support/${ticketId}`);
        return { success: true };
    } catch (error) {
        console.error('Error updating ticket priority:', error);
        return { error: 'Failed to update ticket priority' };
    }
}

export async function updateTicketStatusAndPriority(ticketId: string, status: string, priority: string) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { 
                status,
                priority,
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/support');
        revalidatePath(`/admin/support/${ticketId}`);
        return { success: true };
    } catch (error) {
        console.error('Error updating ticket status and priority:', error);
        return { error: 'Failed to update ticket' };
    }
}
