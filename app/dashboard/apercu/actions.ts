'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type SalesDataPoint = {
    date: string;
    amount: number;
    count: number;
};

export type SalesTrendData = {
    data: SalesDataPoint[];
    total: number;
    previousTotal: number;
    changePercent: number;
    period: string;
};

export async function getSalesTrend(
    period: 'today' | '7days' | '30days' | 'custom',
    startDate?: Date,
    endDate?: Date
): Promise<SalesTrendData> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const store = await prisma.store.findFirst({
        where: { ownerId: session.user.id },
        take: 1
    });

    if (!store) {
        throw new Error('Store not found');
    }

    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);
    let previousStart: Date;
    let previousEnd: Date;

    // Set time to start/end of day
    end.setHours(23, 59, 59, 999);

    switch (period) {
        case 'today':
            start = new Date(now);
            start.setHours(0, 0, 0, 0);
            
            // Previous period: yesterday
            previousEnd = new Date(start);
            previousEnd.setMilliseconds(-1);
            previousStart = new Date(previousEnd);
            previousStart.setHours(0, 0, 0, 0);
            break;

        case '7days':
            start = new Date(now);
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            
            // Previous period: 7 days before
            previousEnd = new Date(start);
            previousEnd.setMilliseconds(-1);
            previousStart = new Date(previousEnd);
            previousStart.setDate(previousStart.getDate() - 6);
            previousStart.setHours(0, 0, 0, 0);
            break;

        case '30days':
            start = new Date(now);
            start.setDate(start.getDate() - 29);
            start.setHours(0, 0, 0, 0);
            
            // Previous period: 30 days before
            previousEnd = new Date(start);
            previousEnd.setMilliseconds(-1);
            previousStart = new Date(previousEnd);
            previousStart.setDate(previousStart.getDate() - 29);
            previousStart.setHours(0, 0, 0, 0);
            break;

        case 'custom':
            if (!startDate || !endDate) {
                throw new Error('Start and end dates required for custom period');
            }
            start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            previousEnd = new Date(start);
            previousEnd.setMilliseconds(-1);
            previousStart = new Date(previousEnd);
            previousStart.setDate(previousStart.getDate() - daysDiff);
            previousStart.setHours(0, 0, 0, 0);
            break;
    }

    // Fetch orders for current period (exclude PENDING and RETURN statuses for sales)
    const orders = await prisma.order.findMany({
        where: {
            storeId: store.id,
            createdAt: {
                gte: start,
                lte: end
            },
            status: {
                notIn: ['PENDING', 'RETURN']
            }
        },
        select: {
            createdAt: true,
            totalAmount: true
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    // Fetch orders for previous period for comparison
    const previousOrders = await prisma.order.findMany({
        where: {
            storeId: store.id,
            createdAt: {
                gte: previousStart,
                lte: previousEnd
            },
            status: {
                notIn: ['PENDING', 'RETURN']
            }
        },
        select: {
            totalAmount: true
        }
    });

    // Group orders by date (or hour for today)
    const dataMap = new Map<string, { amount: number; count: number }>();
    
    if (period === 'today') {
        // Initialize all hours for today up to current hour
        const currentHour = new Date(start);
        const endHour = new Date(now);
        endHour.setMinutes(0, 0, 0); // Round down to current hour
        while (currentHour <= endHour) {
            const hourKey = currentHour.toISOString().slice(0, 13) + ':00'; // YYYY-MM-DDTHH:00
            dataMap.set(hourKey, { amount: 0, count: 0 });
            currentHour.setHours(currentHour.getHours() + 1);
        }
    } else {
        // Initialize all dates in range
        const currentDate = new Date(start);
        while (currentDate <= end) {
            const dateKey = currentDate.toISOString().split('T')[0];
            dataMap.set(dateKey, { amount: 0, count: 0 });
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    // Aggregate orders by date or hour
    orders.forEach((order: typeof orders[number]) => {
        let key: string;
        if (period === 'today') {
            // Group by hour
            const orderDate = new Date(order.createdAt);
            key = orderDate.toISOString().slice(0, 13) + ':00';
        } else {
            // Group by date
            key = order.createdAt.toISOString().split('T')[0];
        }
        const existing = dataMap.get(key) || { amount: 0, count: 0 };
        dataMap.set(key, {
            amount: existing.amount + order.totalAmount,
            count: existing.count + 1
        });
    });

    // Convert to array and sort
    const data: SalesDataPoint[] = Array.from(dataMap.entries())
        .map(([date, values]) => ({
            date,
            amount: values.amount,
            count: values.count
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate totals
    const total = orders.reduce((sum: number, order: typeof orders[number]) => sum + order.totalAmount, 0);
    const previousTotal = previousOrders.reduce((sum: number, order: typeof previousOrders[number]) => sum + order.totalAmount, 0);
    
    // Calculate percentage change
    const changePercent = previousTotal === 0 
        ? (total > 0 ? 100 : 0)
        : ((total - previousTotal) / previousTotal) * 100;

    // Format period label
    let periodLabel = '';
    switch (period) {
        case 'today':
            periodLabel = "Aujourd'hui";
            break;
        case '7days':
            periodLabel = '7 Jours';
            break;
        case '30days':
            periodLabel = '30 Jours';
            break;
        case 'custom':
            periodLabel = `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`;
            break;
    }

    return {
        data,
        total,
        previousTotal,
        changePercent,
        period: periodLabel
    };
}

