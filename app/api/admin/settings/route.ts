import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Get all settings
export async function GET() {
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

        const settings = await prisma.setting.findMany();

        // Convert to object format
        const settingsObj: Record<string, any> = {};
        settings.forEach(setting => {
            let value: any = setting.value;
            if (setting.type === 'number') {
                value = parseFloat(value);
            } else if (setting.type === 'boolean') {
                value = value === 'true';
            }
            settingsObj[setting.key] = value;
        });

        return NextResponse.json({ settings: settingsObj });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des paramètres" },
            { status: 500 }
        );
    }
}

// POST - Update settings
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { settings } = body;

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
        }

        // Update or create each setting
        const updates = Object.entries(settings).map(async ([key, value]) => {
            const stringValue = String(value);
            let type = 'string';
            if (typeof value === 'number') {
                type = 'number';
            } else if (typeof value === 'boolean') {
                type = 'boolean';
            }

            return prisma.setting.upsert({
                where: { key },
                update: { value: stringValue, type },
                create: { key, value: stringValue, type }
            });
        });

        await Promise.all(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour des paramètres" },
            { status: 500 }
        );
    }
}

