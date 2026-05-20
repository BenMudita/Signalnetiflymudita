"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";

export function AppChrome({
  children,
  banner,
}: {
  children: ReactNode;
  banner?: ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  if (isAuthPage) return <>{children}</>;

  return <DashboardShell banner={banner}>{children}</DashboardShell>;
}
