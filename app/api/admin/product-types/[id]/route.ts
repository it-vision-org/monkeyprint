import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// PUT - Update a product type
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, slug, image, backImage, basePrice, displayOrder, isActive, printAreaRatioFront, printAreaRatioBack, printAreaFront, printAreaBack, availableColorIds } = body;

        const productType = await prisma.productType.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(slug && { slug }),
                ...(image !== undefined && { image }),
                ...(backImage !== undefined && { backImage }),
                ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }),
                ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) }),
                ...(isActive !== undefined && { isActive }),
                ...(printAreaRatioFront !== undefined && { printAreaRatioFront: parseFloat(printAreaRatioFront) }),
                ...(printAreaRatioBack !== undefined && { printAreaRatioBack: parseFloat(printAreaRatioBack) }),
                ...(printAreaFront !== undefined && { printAreaFront: typeof printAreaFront === 'string' ? printAreaFront : JSON.stringify(printAreaFront) }),
                ...(printAreaBack !== undefined && { printAreaBack: typeof printAreaBack === 'string' ? printAreaBack : JSON.stringify(printAreaBack) }),
                ...(availableColorIds !== undefined && { availableColorIds: availableColorIds ? JSON.stringify(availableColorIds) : null }),
            },
        });

        return NextResponse.json({ productType });
    } catch (error: any) {
        console.error('Error updating product type:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Product type not found' }, { status: 404 });
        }
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete a product type and all related products
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        console.log('Deleting product type with id:', id);

        // First, get the product type to find its slug
        const productType = await prisma.productType.findUnique({
            where: { id },
        });

        if (!productType) {
            console.log('Product type not found for id:', id);
            return NextResponse.json({ error: 'Product type not found' }, { status: 404 });
        }

        console.log('Found product type:', productType.name, 'slug:', productType.slug);

        // Delete all products that use this product type (by slug)
        const deletedProducts = await prisma.product.deleteMany({
            where: {
                type: productType.slug,
            },
        });

        console.log('Deleted products count:', deletedProducts.count);

        // Delete the product type itself
        // This will cascade delete ProductTypeColor and ProductTypeQuality due to onDelete: Cascade
        await prisma.productType.delete({
            where: { id },
        });

        console.log('Product type deleted successfully');

        return NextResponse.json({ 
            success: true,
            deletedProductsCount: deletedProducts.count 
        });
    } catch (error: any) {
        console.error('Error deleting product type:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Product type not found' }, { status: 404 });
        }
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error.message 
        }, { status: 500 });
    }
}

