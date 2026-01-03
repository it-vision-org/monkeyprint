import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all product qualities
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

        const qualities = await prisma.productQuality.findMany({
            orderBy: { displayOrder: 'asc' },
        });

        return NextResponse.json({ qualities });
    } catch (error) {
        console.error('Error fetching product qualities:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create a new product quality
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
        const { name, price, displayOrder, isActive } = body;

        if (!name || price === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const quality = await prisma.productQuality.create({
            data: {
                name,
                price: parseFloat(price),
                displayOrder: displayOrder ?? 0,
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json({ quality });
    } catch (error) {
        console.error('Error creating product quality:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


