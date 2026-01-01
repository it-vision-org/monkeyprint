import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ count: 0 });
        }

        const store = await prisma.store.findFirst({
            where: { ownerId: session.user.id }
        });

        if (!store) {
            return NextResponse.json({ count: 0 });
        }

        const count = await prisma.product.count({
            where: { storeId: store.id }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error checking product count:', error);
        return NextResponse.json({ count: 0 });
    }
}

