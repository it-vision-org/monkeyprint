import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getR2Url } from '@/lib/storage';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await (await import('@/lib/prisma')).prisma.user.findUnique({ 
            where: { email: session.user.email } 
        });
        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { key } = body;

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        const url = await getR2Url(key);
        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Error getting R2 URL:', error);
        return NextResponse.json({ error: error.message || 'Failed to get R2 URL' }, { status: 500 });
    }
}

