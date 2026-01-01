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

export async function updateProduct(productId: string, formData: FormData) {
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
        }
    });

    if (!product) {
        return { error: 'Product not found or unauthorized' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;

    if (!name || !price) {
        return { error: 'Name and price are required' };
    }

    try {
        await prisma.product.update({
            where: { id: productId },
            data: {
                name,
                description: description || null,
                basePrice: parseFloat(price),
            }
        });

        revalidatePath('/dashboard/produits');
        revalidatePath(`/dashboard/produits/${productId}/edit`);
        return { success: true };
    } catch (error) {
        console.error('Error updating product:', error);
        return { error: 'Failed to update product' };
    }
}

