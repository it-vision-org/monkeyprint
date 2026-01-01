import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { stores: true }
        });

        if (!user || user.stores.length === 0) {
            return NextResponse.json({ error: "Aucune boutique trouvée" }, { status: 404 });
        }

        const store = user.stores[0];

        // Calculate available amount (PAID/COMPLETED orders)
        const availableOrders = await prisma.order.findMany({
            where: {
                storeId: store.id,
                status: { in: ['PAID', 'COMPLETED'] }
            }
        });

        const availableAmount = availableOrders.reduce((acc, o) => acc + o.totalAmount, 0);

        // Subtract pending withdrawals
        const pendingWithdrawals = await prisma.withdrawal.findMany({
            where: {
                storeId: store.id,
                status: 'PENDING'
            }
        });

        const pendingAmount = pendingWithdrawals.reduce((acc, w) => acc + w.amount, 0);
        const actuallyAvailable = Math.max(0, availableAmount - pendingAmount);

        return NextResponse.json({ availableAmount: actuallyAvailable });
    } catch (error) {
        console.error("Error fetching balance:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération du solde" },
            { status: 500 }
        );
    }
}

