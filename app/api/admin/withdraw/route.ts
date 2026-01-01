import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - List all withdrawals for admin
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
        const status = searchParams.get('status') || 'all';

        const where: any = {};
        if (status !== 'all') {
            where.status = status.toUpperCase();
        }

        const withdrawals = await prisma.withdrawal.findMany({
            where,
            include: {
                store: {
                    include: {
                        owner: true
                    }
                }
            },
            orderBy: { requestedAt: 'desc' }
        });

        return NextResponse.json({ withdrawals });
    } catch (error) {
        console.error("Error fetching withdrawals:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des retraits" },
            { status: 500 }
        );
    }
}


