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
                { name: { contains: query, mode: 'insensitive' } },
                { slug: { contains: query, mode: 'insensitive' } },
                { owner: { email: { contains: query, mode: 'insensitive' } } },
                { owner: { name: { contains: query, mode: 'insensitive' } } },
            ];
        }

        const stores = await prisma.store.findMany({
            where,
            include: {
                owner: true,
                _count: {
                    select: { products: true, orders: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Generate CSV
        const headers = ['ID', 'Nom', 'Slug', 'Propriétaire', 'Email', 'Statut', 'Produits', 'Commandes', 'Thème', 'Date de création'];
        const rows = stores.map((store: typeof stores[number]) => [
            store.id,
            `"${store.name.replace(/"/g, '""')}"`,
            store.slug,
            `"${(store.owner.name || '').replace(/"/g, '""')}"`,
            store.owner.email,
            store.status,
            store._count.products.toString(),
            store._count.orders.toString(),
            store.theme,
            new Date(store.createdAt).toLocaleDateString('fr-FR')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row: string[]) => row.join(','))
        ].join('\n');

        // Return CSV file
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="magasins-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("Error exporting stores:", error);
        return NextResponse.json(
            { error: "Erreur lors de l'export" },
            { status: 500 }
        );
    }
}


