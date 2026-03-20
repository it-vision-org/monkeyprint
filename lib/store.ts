import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getR2Url } from "@/lib/storage";

type DashboardOrderStats = {
  nonConfirmed: number;
  confirmed: number;
  retours: number;
};

export async function getStoreInfo() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { store: true }
    });

    if (!user || !user.store) {
      return null;
    }

    const store = user.store;
    
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

export async function getDashboardOrderStats(): Promise<DashboardOrderStats> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { nonConfirmed: 0, confirmed: 0, retours: 0 };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        store: {
          select: {
            id: true
          }
        }
      }
    });

    if (!user?.store?.id) {
      return { nonConfirmed: 0, confirmed: 0, retours: 0 };
    }

    const grouped = await prisma.order.groupBy({
      by: ["status"],
      where: {
        storeId: user.store.id
      },
      _count: {
        _all: true
      }
    });

    const countByStatus = grouped.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {});

    const nonConfirmed = countByStatus.PENDING ?? 0;
    const retours = countByStatus.RETURN ?? 0;
    const confirmed =
      (countByStatus.CONFIRMED ?? 0) +
      (countByStatus.IN_TREATMENT ?? 0) +
      (countByStatus.IN_DELIVERY ?? 0) +
      (countByStatus.DELIVERED_AND_PAID ?? 0);

    return { nonConfirmed, confirmed, retours };
  } catch (error) {
    console.error("Error fetching dashboard order stats:", error);
    return { nonConfirmed: 0, confirmed: 0, retours: 0 };
  }
}

