import { OUTPOST_ADMIN_BASE } from "@/modules/admin/outpost-admin-paths";
import { SECURE_AUTH_CORE_BASE } from "@/modules/admin/secure-auth-core-paths";

export type AdminNavItem = {
  href: string;
  label: string;
  external?: boolean;
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/posts/new", label: "New Post" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/import", label: "Import" },
  { href: SECURE_AUTH_CORE_BASE, label: "Auth admin" },
  { href: `${SECURE_AUTH_CORE_BASE}/users`, label: "Users" },
  { href: `${SECURE_AUTH_CORE_BASE}/locks`, label: "Account locks" },
  { href: `${SECURE_AUTH_CORE_BASE}/api-keys`, label: "API keys" },
  { href: `${SECURE_AUTH_CORE_BASE}/config`, label: "Auth config" },
  { href: OUTPOST_ADMIN_BASE, label: "Outpost admin" },
  { href: `${OUTPOST_ADMIN_BASE}/queue`, label: "Email queue" },
  { href: `${OUTPOST_ADMIN_BASE}/config`, label: "Outpost config" },
  { href: `${OUTPOST_ADMIN_BASE}/observability`, label: "Outpost metrics" },
  { href: "/", label: "Public Blog", external: true },
  { href: "/admin/account", label: "Account" },
  { href: "/admin/security", label: "Security" },
  { href: "/admin/sessions", label: "Sessions" },
];

export function isAdminNavItemActive(pathname: string, item: AdminNavItem): boolean {
  if (item.external) {
    return false;
  }

  if (item.href === "/admin") {
    return pathname === "/admin";
  }

  if (item.href === "/admin/posts") {
    return pathname === "/admin/posts" || /^\/admin\/posts\/(?!new(?:\/|$))/.test(pathname);
  }

  if (item.href === SECURE_AUTH_CORE_BASE) {
    return pathname === SECURE_AUTH_CORE_BASE;
  }

  if (item.href === OUTPOST_ADMIN_BASE) {
    return pathname === OUTPOST_ADMIN_BASE;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
