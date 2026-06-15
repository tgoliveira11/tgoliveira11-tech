import { adminNavItems } from "@/modules/admin/admin-navigation";
import { AdminNavLink } from "./admin-nav-link";

export function AdminSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <nav aria-label="Admin navigation" className="sticky top-6 space-y-1">
        {adminNavItems.map((item) => (
          <AdminNavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}
