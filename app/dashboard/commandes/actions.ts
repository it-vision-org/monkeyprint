'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function confirmOrder(orderId: string) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    // Verify ownership
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { store: { include: { owner: true } } }
    });

    if (!order || order.store.owner.email !== session.user.email) {
        return { error: "Unauthorized" };
    }

    await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' } // Mapping 'Confirmé' to 'PAID'
    });

    revalidatePath('/dashboard/commandes');
    return { success: true };
}

export async function deleteOrder(orderId: string) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { store: { include: { owner: true } } }
    });

    if (!order || order.store.owner.email !== session.user.email) {
        return { error: "Unauthorized" };
    }

    await prisma.order.delete({
        where: { id: orderId }
    });

    revalidatePath('/dashboard/commandes');
    return { success: true };
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    // Verify ownership
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { store: { include: { owner: true } } }
    });

    if (!order || order.store.owner.email !== session.user.email) {
        return { error: "Unauthorized" };
    }

    // Validate status
    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'RETURNED'];
    if (!validStatuses.includes(newStatus)) {
        return { error: "Invalid status" };
    }

    await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus }
    });

    revalidatePath('/dashboard/commandes');
    revalidatePath(`/dashboard/commandes/${orderId}`);
    return { success: true };
}