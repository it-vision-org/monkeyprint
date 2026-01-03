import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// PUT - Update a quality
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; qualityId: string }> }
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

        const { id, qualityId } = await params;
        const body = await request.json();
        const { name, price, displayOrder, isDefault, isActive } = body;

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.productTypeQuality.updateMany({
                where: { productTypeId: id, isDefault: true, id: { not: qualityId } },
                data: { isDefault: false },
            });
        }

        const quality = await prisma.productTypeQuality.update({
            where: { id: qualityId },
            data: {
                ...(name && { name }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) }),
                ...(isDefault !== undefined && { isDefault }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json({ quality });
    } catch (error: any) {
        console.error('Error updating quality:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Quality not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete a quality
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; qualityId: string }> }
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

        const { qualityId } = await params;

        await prisma.productTypeQuality.delete({
            where: { id: qualityId },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting quality:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Quality not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

