import Link from "next/link";
import { AdminSignOutButton } from "./admin-sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { adminNavItems } from "@/modules/admin/admin-navigation";

export function AdminHeader({ adminEmail }: { adminEmail: string }) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <Link href="/admin" className="text-lg font-semibold">
            PostForge Admin
          </Link>
          <p className="text-sm text-[var(--muted)]">{adminEmail}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Admin quick links" className="flex flex-wrap gap-2 md:hidden">
            {adminNavItems.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle compact />
          <AdminSignOutButton />
        </div>
      </div>
    </header>
  );
}
