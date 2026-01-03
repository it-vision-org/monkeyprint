import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all qualities for a product type
export async function GET(
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
        const qualities = await prisma.productTypeQuality.findMany({
            where: { productTypeId: id },
            orderBy: { displayOrder: 'asc' },
        });

        return NextResponse.json({ qualities });
    } catch (error) {
        console.error('Error fetching qualities:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create a new quality for a product type
export async function POST(
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
        const { name, price, displayOrder, isDefault, isActive } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.productTypeQuality.updateMany({
                where: { productTypeId: id, isDefault: true },
                data: { isDefault: false },
            });
        }

        const quality = await prisma.productTypeQuality.create({
            data: {
                productTypeId: id,
                name,
                price: parseFloat(price) || 0,
                displayOrder: displayOrder ?? 0,
                isDefault: isDefault ?? false,
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json({ quality });
    } catch (error: any) {
        console.error('Error creating quality:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Quality name already exists for this product' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

