'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    const shopName = formData.get('shopName') as string;
    const storeId = formData.get('storeId') as string;

    // Update Store Name
    if (storeId && shopName) {
        await prisma.store.update({
            where: { id: storeId, owner: { email: session.user.email } },
            data: { name: shopName }
        });
    }

    revalidatePath('/dashboard/compte');
    return { success: "Profil mis à jour" };
}

export async function updateStoreTheme(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    const theme = formData.get('theme') as string;
    const storeId = formData.get('storeId') as string;

    if (!theme || !storeId) {
        return { error: "Theme et Store ID requis" };
    }

    // Validate theme value
    const validThemes = ['theme-1', 'theme-2', 'theme-3'];
    if (!validThemes.includes(theme)) {
        return { error: "Thème invalide" };
    }

    // Update Store Theme
    await prisma.store.update({
        where: { id: storeId, owner: { email: session.user.email } },
        data: { theme }
    });

    revalidatePath('/dashboard/parametres');
    revalidatePath('/dashboard/compte');
    // Also revalidate the store page
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (store) {
        revalidatePath(`/shop/${store.slug}`);
    }

    return { success: "Thème mis à jour" };
}