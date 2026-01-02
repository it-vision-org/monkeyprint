import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getR2Url } from "@/lib/storage";

export async function getStoreInfo() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { stores: true }
    });

    if (!user || user.stores.length === 0) {
      return null;
    }

    const store = user.stores[0];
    
    // Resolve logo URL if it exists
    const logoUrl = store.logoUrl ? await getR2Url(store.logoUrl) : null;

    return {
      slug: store.slug,
      theme: store.theme || 'theme-1',
      name: store.name,
      logoUrl: logoUrl
    };
  } catch (error) {
    console.error("Error fetching store info:", error);
    return null;
  }
}

