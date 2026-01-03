import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// PUT - Update a product quality
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
        const { name, price, displayOrder, isActive } = body;

        const quality = await prisma.productQuality.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json({ quality });
    } catch (error: any) {
        console.error('Error updating product quality:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Product quality not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete a product quality
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

        await prisma.productQuality.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting product quality:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Product quality not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


