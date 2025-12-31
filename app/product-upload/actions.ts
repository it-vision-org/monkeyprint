'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { uploadImageToR2 } from '@/lib/storage';
import { redirect } from 'next/navigation';

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

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const type = formData.get('type') as string;
    const designData = formData.get('designData') as string;
    const frontImageBase64 = formData.get('frontImage') as string;
    const backImageBase64 = formData.get('backImage') as string;

    let previewFront = null;
    let previewBack = null;

    try {
        if (frontImageBase64) {
            previewFront = await uploadImageToR2(frontImageBase64, 'products');
        }
        if (backImageBase64) {
            previewBack = await uploadImageToR2(backImageBase64, 'products');
        }

        await prisma.product.create({
            data: {
                name,
                description,
                basePrice: price,
                type: type || 'tshirt',
                designData,
                previewFront,
                previewBack,
                storeId: store.id
            }
        });

    } catch (e) {
        console.error('Product creation failed:', e);
        return { error: 'Failed to create product' };
    }

    redirect('/dashboard/apercu');
}
