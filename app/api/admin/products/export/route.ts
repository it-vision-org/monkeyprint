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

        const where: any = {};
        if (query) {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { store: { name: { contains: query, mode: 'insensitive' } } },
            ];
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                store: true,
                _count: {
                    select: { orderItems: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Generate CSV
        const headers = ['ID', 'Nom', 'Magasin', 'Prix (DT)', 'Type', 'Vendu', 'Date de création'];
        const rows = products.map(product => [
            product.id,
            `"${product.name.replace(/"/g, '""')}"`,
            `"${product.store.name.replace(/"/g, '""')}"`,
            product.basePrice.toFixed(2),
            product.type,
            product._count.orderItems.toString(),
            new Date(product.createdAt).toLocaleDateString('fr-FR')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Return CSV file
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="produits-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("Error exporting products:", error);
        return NextResponse.json(
            { error: "Erreur lors de l'export" },
            { status: 500 }
        );
    }
}


