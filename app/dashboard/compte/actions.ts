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
