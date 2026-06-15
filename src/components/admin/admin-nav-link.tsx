"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type AdminNavItem, isAdminNavItemActive } from "@/modules/admin/admin-navigation";

export function AdminNavLink({ item }: { item: AdminNavItem }) {
  const pathname = usePathname();
  const active = isAdminNavItemActive(pathname, item);

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`block rounded-md px-3 py-2 text-sm hover:bg-[var(--card)] hover:shadow-sm ${
        active
          ? "bg-[var(--card)] font-medium text-[var(--foreground)] shadow-sm"
          : "text-[var(--foreground)]"
      }`}
      {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {item.label}
      {item.external ? " ↗" : ""}
    </Link>
  );
}
