"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function StorefrontOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return null;
  return children;
}
