import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch pricing settings (only one record should exist)
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

        let settings = await prisma.pricingSettings.findFirst();

        // If no settings exist, create default ones
        if (!settings) {
            settings = await prisma.pricingSettings.create({
                data: {
                    designFee: 30,
                    minPrice: 55,
                    profitCalculationType: 'DIFFERENCE',
                },
            });
        }

        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Error fetching pricing settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update pricing settings
export async function PUT(request: NextRequest) {
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
        const { designFee, minPrice, profitCalculationType, profitPercentage, profitFixedAmount } = body;

        // Get existing settings or create new
        let settings = await prisma.pricingSettings.findFirst();

        if (settings) {
            settings = await prisma.pricingSettings.update({
                where: { id: settings.id },
                data: {
                    ...(designFee !== undefined && { designFee: parseFloat(designFee) }),
                    ...(minPrice !== undefined && { minPrice: parseFloat(minPrice) }),
                    ...(profitCalculationType && { profitCalculationType }),
                    ...(profitPercentage !== undefined && { profitPercentage: parseFloat(profitPercentage) }),
                    ...(profitFixedAmount !== undefined && { profitFixedAmount: parseFloat(profitFixedAmount) }),
                },
            });
        } else {
            settings = await prisma.pricingSettings.create({
                data: {
                    designFee: designFee ? parseFloat(designFee) : 30,
                    minPrice: minPrice ? parseFloat(minPrice) : 55,
                    profitCalculationType: profitCalculationType || 'DIFFERENCE',
                    profitPercentage: profitPercentage ? parseFloat(profitPercentage) : null,
                    profitFixedAmount: profitFixedAmount ? parseFloat(profitFixedAmount) : null,
                },
            });
        }

        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Error updating pricing settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


