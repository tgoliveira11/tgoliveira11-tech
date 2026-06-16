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

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
