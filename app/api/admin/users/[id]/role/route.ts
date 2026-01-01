import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Check for admin role
        const adminUser = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (adminUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        // Prevent self-demotion
        if (adminUser.id === params.id) {
            return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre rôle" }, { status: 400 });
        }

        const { role } = await request.json();

        if (!role || !['ADMIN', 'USER'].includes(role)) {
            return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data: { role },
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Error updating user role:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du rôle" },
            { status: 500 }
        );
    }
}

