import Link from "next/link";
import { adminNavItems } from "@/modules/admin/admin-navigation";

export function AdminSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <nav aria-label="Admin navigation" className="sticky top-6 space-y-1">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--card)] hover:shadow-sm"
            {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {item.label}
            {item.external ? " ↗" : ""}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
