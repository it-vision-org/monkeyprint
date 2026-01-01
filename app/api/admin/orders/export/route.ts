import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Check for admin role
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const status = searchParams.get('status') || 'all';

        const where: any = {};
        if (status !== 'all') {
            where.status = status.toUpperCase();
        }
        if (query) {
            where.OR = [
                { id: { contains: query, mode: 'insensitive' } },
                { store: { name: { contains: query, mode: 'insensitive' } } },
                { customer: { name: { contains: query, mode: 'insensitive' } } },
            ];
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                store: true,
                customer: true,
                _count: {
                    select: { orderItems: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Generate CSV
        const headers = ['ID', 'Magasin', 'Client', 'Téléphone', 'Articles', 'Montant (DT)', 'Statut', 'Date de création'];
        const rows = orders.map(order => [
            order.id,
            `"${order.store.name.replace(/"/g, '""')}"`,
            `"${(order.customer.name || '').replace(/"/g, '""')}"`,
            order.customer.phoneNumber,
            order._count.orderItems.toString(),
            order.totalAmount.toFixed(2),
            order.status,
            new Date(order.createdAt).toLocaleDateString('fr-FR')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Return CSV file
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="commandes-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("Error exporting orders:", error);
        return NextResponse.json(
            { error: "Erreur lors de l'export" },
            { status: 500 }
        );
    }
}

