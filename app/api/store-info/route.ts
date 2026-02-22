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
            id: store.id,
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

export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { slug } = body;

        if (!slug) {
            return NextResponse.json({ error: "Slug requis" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { store: true }
        });

        if (!user || !user.store) {
            return NextResponse.json({ error: "Aucune boutique trouvée" }, { status: 404 });
        }

        const existingStore = await prisma.store.findUnique({ where: { slug } });
        if (existingStore && existingStore.id !== user.store.id) {
            return NextResponse.json({ error: "Ce slug est déjà utilisé" }, { status: 400 });
        }

        const updatedStore = await prisma.store.update({
            where: { id: user.store.id },
            data: { slug }
        });

        return NextResponse.json({ slug: updatedStore.slug });
    } catch (error) {
        console.error("Error updating store info:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour des informations de la boutique" },
            { status: 500 }
        );
    }
}


