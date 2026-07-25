import Link from "next/link";
import { AdminMobileMenu } from "./admin-mobile-menu";
import { AdminSignOutButton } from "./admin-sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const viewSiteLinkClassName =
  "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

export function AdminHeader({ adminEmail }: { adminEmail: string }) {
  return (
    <header className="relative border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-[1000px] flex-col items-stretch gap-3 px-3 py-3 sm:px-4 sm:py-4 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href="/admin" className="block truncate text-lg font-semibold">
              PostForge Admin
            </Link>
            <p className="truncate text-sm text-[var(--muted)]">{adminEmail}</p>
          </div>
          <AdminMobileMenu />
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <Link href="/" className={viewSiteLinkClassName}>
            View site
          </Link>
          <ThemeToggle compact />
          <AdminSignOutButton />
        </div>
      </div>
    </header>
  );
}
