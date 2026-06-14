export type AdminNavItem = {
  href: string;
  label: string;
  external?: boolean;
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/posts/new", label: "New Post" },
  { href: "/", label: "Public Blog", external: true },
  { href: "/settings/account", label: "Account" },
  { href: "/settings/security", label: "Security" },
];
