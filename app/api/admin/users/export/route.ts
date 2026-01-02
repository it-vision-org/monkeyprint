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
        const role = searchParams.get('role') || 'all';

        const where: any = {};
        if (role !== 'all') {
            where.role = role.toUpperCase();
        }
        if (query) {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                _count: {
                    select: { store: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Generate CSV
        const headers = ['ID', 'Nom', 'Email', 'Rôle', 'Magasins', 'Date d\'inscription'];
        const rows = users.map((user: typeof users[number]) => [
            user.id,
            `"${(user.name || '').replace(/"/g, '""')}"`,
            user.email,
            user.role,
            user._count.store.toString(),
            new Date(user.createdAt).toLocaleDateString('fr-FR')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row: string[]) => row.join(','))
        ].join('\n');

        // Return CSV file
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="utilisateurs-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("Error exporting users:", error);
        return NextResponse.json(
            { error: "Erreur lors de l'export" },
            { status: 500 }
        );
    }
}


