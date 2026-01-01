import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Check for admin role
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        const { status } = await request.json();

        if (!status || !['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
            return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
        }

        const store = await prisma.store.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json({ success: true, store });
    } catch (error) {
        console.error("Error updating store status:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du statut" },
            { status: 500 }
        );
    }
}

