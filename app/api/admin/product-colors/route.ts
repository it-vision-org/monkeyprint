import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all product colors
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const colors = await prisma.productColor.findMany({
            orderBy: { displayOrder: 'asc' },
        });

        return NextResponse.json({ colors });
    } catch (error) {
        console.error('Error fetching product colors:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create a new product color
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, hex, filter, displayOrder, isActive } = body;

        if (!name || !hex) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const color = await prisma.productColor.create({
            data: {
                name,
                hex,
                filter,
                displayOrder: displayOrder ?? 0,
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json({ color });
    } catch (error) {
        console.error('Error creating product color:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


