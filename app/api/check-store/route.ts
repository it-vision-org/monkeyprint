import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ hasStore: false });
        }

        const store = await prisma.store.findFirst({
            where: { ownerId: session.user.id }
        });

        return NextResponse.json({ hasStore: !!store });
    } catch (error) {
        console.error('Error checking store:', error);
        return NextResponse.json({ hasStore: false });
    }
}

