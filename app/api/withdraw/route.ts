import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST - Create withdrawal request
export async function POST(request: NextRequest) {
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
        const { amount, bankDetails } = await request.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
        }

        // Only count DELIVERED_AND_PAID orders that are more than 14 days old
        const now = new Date();
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const availableOrders = await prisma.order.findMany({
            where: {
                storeId: store.id,
                status: 'DELIVERED_AND_PAID',
                deliveredAt: {
                    lte: fourteenDaysAgo
                }
            }
        });

        const availableAmount = availableOrders.reduce((acc, o) => acc + o.totalAmount, 0);

        // Check pending withdrawals
        const pendingWithdrawals = await prisma.withdrawal.findMany({
            where: {
                storeId: store.id,
                status: 'PENDING'
            }
        });

        const pendingAmount = pendingWithdrawals.reduce((acc, w) => acc + w.amount, 0);
        const actuallyAvailable = availableAmount - pendingAmount;

        if (amount > actuallyAvailable) {
            return NextResponse.json({ 
                error: `Montant indisponible. Maximum disponible: ${actuallyAvailable.toFixed(2)} DT` 
            }, { status: 400 });
        }

        // Create withdrawal request
        const withdrawal = await prisma.withdrawal.create({
            data: {
                storeId: store.id,
                amount,
                bankDetails: bankDetails || null,
                status: 'PENDING'
            }
        });

        return NextResponse.json({ success: true, withdrawal });
    } catch (error) {
        console.error("Error creating withdrawal:", error);
        return NextResponse.json(
            { error: "Erreur lors de la création de la demande de retrait" },
            { status: 500 }
        );
    }
}

// GET - List withdrawals for current user's store
export async function GET(request: NextRequest) {
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

        const withdrawals = await prisma.withdrawal.findMany({
            where: { storeId: store.id },
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

