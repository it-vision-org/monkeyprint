import type { ReactNode } from "react";
import { Suspense } from "react";

import { DashboardLayout } from "@/components";
import { getDashboardOrderStats, getStoreInfo } from "@/lib/store";

// Mark this route as dynamic since it uses auth() which requires headers
export const dynamic = 'force-dynamic';

async function DashboardLayoutWrapper({ children }: { children: ReactNode }) {
  const [storeInfo, orderStats] = await Promise.all([
    getStoreInfo(),
    getDashboardOrderStats()
  ]);

  return (
    <DashboardLayout
      storeInfo={storeInfo ? { name: storeInfo.name, logoUrl: storeInfo.logoUrl } : null}
      commandesStats={orderStats}
    >
      {children}
    </DashboardLayout>
  );
}

export default function DashboardRouteLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
    </Suspense>
  );
}









