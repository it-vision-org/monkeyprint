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

        // Validate status - only allow transitions after CONFIRMED
        const validStatuses = ['CONFIRMED', 'IN_TREATMENT', 'IN_DELIVERY', 'DELIVERED_AND_PAID', 'RETURN'];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
        }

        // Get current order
        const order = await prisma.order.findUnique({
            where: { id }
        });

        if (!order) {
            return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
        }

        // Can only update orders that are CONFIRMED or later
        if (order.status === 'PENDING') {
            return NextResponse.json({ error: "Les commandes en attente doivent être confirmées par le propriétaire du magasin" }, { status: 400 });
        }

        // Prepare update data
        const updateData: any = { status };

        // Set deliveredAt when status changes to DELIVERED_AND_PAID
        if (status === 'DELIVERED_AND_PAID' && order.status !== 'DELIVERED_AND_PAID') {
            updateData.deliveredAt = new Date();
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du statut" },
            { status: 500 }
        );
    }
}

