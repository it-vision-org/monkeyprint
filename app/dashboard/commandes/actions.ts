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

    // Only allow confirming PENDING orders
    if (order.status !== 'PENDING') {
        return { error: "Only pending orders can be confirmed" };
    }

    await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' }
    });

    revalidatePath('/dashboard/commandes');
    revalidatePath(`/dashboard/commandes/${orderId}`);
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

    // If order is PENDING (not confirmed), delete it directly
    // Otherwise, mark as deletion requested for admin approval
    if (order.status === 'PENDING') {
        // Delete order items first, then the order
        await prisma.orderItem.deleteMany({
            where: { orderId: orderId }
        });
        await prisma.order.delete({
            where: { id: orderId }
        });
    } else {
        // For confirmed orders, mark as deletion requested
        await prisma.order.update({
            where: { id: orderId },
            data: { deletionRequested: true }
        });
    }

    revalidatePath('/dashboard/commandes');
    revalidatePath(`/dashboard/commandes/${orderId}`);
    return { success: true };
}

// Note: Store owners can only confirm orders. Status updates after confirmation are admin-only.
// This function is kept for backwards compatibility but should not be used by store owners.
export async function updateOrderStatus(orderId: string, newStatus: string) {
    return { error: "Status updates after confirmation are admin-only. Please use the admin panel." };
}