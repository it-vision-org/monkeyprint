import type { ReactNode } from "react";
import { Suspense } from "react";

import DashboardLayout from "@/components/DashboardLayout";
import { getStoreInfo } from "@/lib/store";

async function DashboardLayoutWrapper({ children }: { children: ReactNode }) {
  const storeInfo = await getStoreInfo();
  
  return (
    <DashboardLayout storeInfo={storeInfo ? { name: storeInfo.name, logoUrl: storeInfo.logoUrl } : null}>
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









