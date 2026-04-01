'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { uploadImageToR2 } from '@/lib/storage';
import { redirect } from 'next/navigation';
import { getR2Url } from '@/lib/storage';

export async function getProductForEdit(productId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Not authenticated' };
    }

    const store = await prisma.store.findFirst({
        where: { ownerId: session.user.id }
    });

    if (!store) {
        return { error: 'Store not found' };
    }

    const product = await prisma.product.findFirst({
        where: {
            id: productId,
            storeId: store.id
        }
    });

    if (!product) {
        return { error: 'Product not found or unauthorized' };
    }

    // Get preview image URL if exists
    let previewFrontUrl = null;
    if (product.previewFront) {
        try {
            previewFrontUrl = await getR2Url(product.previewFront);
        } catch (e) {
            console.error('Error getting preview URL:', e);
        }
    }

    return {
        product: {
            id: product.id,
            name: product.name,
            description: product.description,
            basePrice: product.basePrice,
            type: product.type,
            designData: product.designData,
            previewFront: previewFrontUrl,
        }
    };
}

export async function createProduct(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Not authenticated' };
    }

    const store = await prisma.store.findFirst({
        where: { ownerId: session.user.id }
    });

    if (!store) {
        return { error: 'Store not found' };
    }

    const name = (formData.get('name') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const price = parseFloat(formData.get('price') as string);
    const type = formData.get('type') as string;
    const designData = formData.get('designData') as string;
    const mockupImageBase64 = formData.get('mockupImage') as string;
    const productId = formData.get('productId') as string | null; // For edit mode

    if (!name) {
        return { error: 'Le nom du produit est requis' };
    }
    if (!Number.isFinite(price) || price <= 0) {
        return { error: 'Le prix doit être supérieur à 0' };
    }

    let previewFront = null;
    const previewBack = null;
    let savedProductId: string | null = null;

    try {
        // Upload only the final mockup/combined image
        if (mockupImageBase64) {
            previewFront = await uploadImageToR2(mockupImageBase64, 'products');
        }

        // If productId is provided, update existing product
        if (productId) {
            // Verify the product belongs to the user's store
            const existingProduct = await prisma.product.findFirst({
                where: {
                    id: productId,
                    storeId: store.id
                }
            });

            if (!existingProduct) {
                return { error: 'Product not found or unauthorized' };
            }

            const updatedProduct = await prisma.product.update({
                where: { id: productId },
                data: {
                    name,
                    description: description || null,
                    basePrice: price,
                    type: type || 'tshirt',
                    designData,
                    ...(previewFront && { previewFront }), // Only update if new image provided
                }
            });
            savedProductId = updatedProduct.id;
        } else {
            // Create new product
            const createdProduct = await prisma.product.create({
                data: {
                    name,
                    description: description || null,
                    basePrice: price,
                    type: type || 'tshirt',
                    designData,
                    previewFront,
                    previewBack, // Keep as null for now
                    storeId: store.id
                }
            });
            savedProductId = createdProduct.id;
        }
    } catch (e) {
        console.error('Product save failed:', e);
        return { error: 'Failed to save product' };
    }

    // Clean up sessionStorage edit data if editing
    if (productId) {
        // Note: We can't directly access sessionStorage in server action,
        // but the client will handle cleanup on redirect
    }

    const mode = productId ? "updated" : "created";
    const successPath = `/dashboard/produits?status=${mode}&productId=${savedProductId || ""}&storeSlug=${encodeURIComponent(store.slug)}`;
    redirect(successPath);
}
