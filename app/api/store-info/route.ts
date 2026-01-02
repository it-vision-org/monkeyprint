import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getR2Url } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { store: true }
        });

        if (!user || !user.store) {
            return NextResponse.json({ error: "Aucune boutique trouvée" }, { status: 404 });
        }

        const store = user.store;
        
        // Resolve logo URL if it exists
        const logoUrl = store.logoUrl ? await getR2Url(store.logoUrl) : null;

        return NextResponse.json({ 
            slug: store.slug,
            theme: store.theme || 'theme-1',
            name: store.name,
            logoUrl: logoUrl
        });
    } catch (error) {
        console.error("Error fetching store info:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des informations de la boutique" },
            { status: 500 }
        );
    }
}


