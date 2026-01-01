'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteProduct(productId: string) {
    const session = await auth();
    if (!session?.user?.email) {
        return { error: 'Not authenticated' };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stores: true }
    });

    if (!user || user.stores.length === 0) {
        return { error: 'Store not found' };
    }

    const store = user.stores[0];

    // Verify the product belongs to the user's store
    const product = await prisma.product.findFirst({
        where: {
            id: productId,
            storeId: store.id
        },
        include: {
            _count: {
                select: { orderItems: true }
            }
        }
    });

    if (!product) {
        return { error: 'Product not found or unauthorized' };
    }

    try {
        // Delete the product (this will cascade delete orderItems if foreign key is set up)
        await prisma.product.delete({
            where: { id: productId }
        });

        revalidatePath('/dashboard/produits');
        return { success: true };
    } catch (error) {
        console.error('Error deleting product:', error);
        return { error: 'Failed to delete product' };
    }
}

