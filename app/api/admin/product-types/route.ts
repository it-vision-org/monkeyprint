import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all product types
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

        const productTypes = await prisma.productType.findMany({
            orderBy: { displayOrder: 'asc' },
        });

        return NextResponse.json({ productTypes });
    } catch (error) {
        console.error('Error fetching product types:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create a new product type
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
        const { name, slug, image, backImage, basePrice, displayOrder, isActive, printAreaRatioFront, printAreaRatioBack, printAreaFront, printAreaBack, availableColorIds } = body;

        if (!name || !slug || !image || basePrice === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const productType = await prisma.productType.create({
            data: {
                name,
                slug,
                image,
                backImage,
                basePrice: parseFloat(basePrice),
                displayOrder: displayOrder ?? 0,
                isActive: isActive ?? true,
                printAreaRatioFront: printAreaRatioFront !== undefined ? parseFloat(printAreaRatioFront) : 0.8,
                printAreaRatioBack: printAreaRatioBack !== undefined ? parseFloat(printAreaRatioBack) : 0.8,
                printAreaFront: printAreaFront ? (typeof printAreaFront === 'string' ? printAreaFront : JSON.stringify(printAreaFront)) : null,
                printAreaBack: printAreaBack ? (typeof printAreaBack === 'string' ? printAreaBack : JSON.stringify(printAreaBack)) : null,
                availableColorIds: availableColorIds ? JSON.stringify(availableColorIds) : null,
            },
        });

        return NextResponse.json({ productType });
    } catch (error: any) {
        console.error('Error creating product type:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

