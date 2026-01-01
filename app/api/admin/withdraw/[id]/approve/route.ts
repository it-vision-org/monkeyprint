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

        const { action, notes } = await request.json(); // action: 'APPROVE' or 'REJECT'

        if (!action || !['APPROVE', 'REJECT'].includes(action)) {
            return NextResponse.json({ error: "Action invalide" }, { status: 400 });
        }

        const withdrawal = await prisma.withdrawal.findUnique({
            where: { id: params.id }
        });

        if (!withdrawal) {
            return NextResponse.json({ error: "Retrait non trouvé" }, { status: 404 });
        }

        if (withdrawal.status !== 'PENDING') {
            return NextResponse.json({ error: "Ce retrait a déjà été traité" }, { status: 400 });
        }

        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

        const updatedWithdrawal = await prisma.withdrawal.update({
            where: { id: params.id },
            data: {
                status: newStatus,
                processedAt: new Date(),
                processedBy: adminUser.id,
                notes: notes || null
            }
        });

        return NextResponse.json({ success: true, withdrawal: updatedWithdrawal });
    } catch (error) {
        console.error("Error processing withdrawal:", error);
        return NextResponse.json(
            { error: "Erreur lors du traitement du retrait" },
            { status: 500 }
        );
    }
}

