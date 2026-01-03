import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// PUT - Update a product color
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
        const { name, hex, filter, displayOrder, isActive } = body;

        const color = await prisma.productColor.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(hex && { hex }),
                ...(filter !== undefined && { filter }),
                ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json({ color });
    } catch (error: any) {
        console.error('Error updating product color:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Product color not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete a product color
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

        await prisma.productColor.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting product color:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Product color not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


