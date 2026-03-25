import type { ReactNode } from "react";

import { AdminLayout } from "@/components";

import "@/app/styles/admin.css";

export const metadata = {
  title: "Administration · Monkey Print",
  robots: { index: false, follow: false },
};

export default function AdminRouteLayout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}

