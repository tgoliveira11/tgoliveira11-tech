"use client";

import { useId, useState } from "react";
import { adminNavItems } from "@/modules/admin/admin-navigation";
import { AdminNavLink } from "./admin-nav-link";

export function AdminMobileMenu() {
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-controls={menuId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
      >
        <span className="sr-only">Toggle admin navigation</span>
        <span aria-hidden="true" className="flex flex-col gap-1">
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
        </span>
      </button>

      <div
        id={menuId}
        className={`absolute left-3 right-3 top-full z-30 mt-2 ${isOpen ? "block" : "hidden"}`}
      >
        <nav
          aria-label="Admin mobile navigation"
          onClick={() => setIsOpen(false)}
          className="max-h-[calc(100vh-7rem)] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 shadow-[var(--shadow-sm)]"
        >
          {adminNavItems.map((item) => (
            <AdminNavLink key={item.href} item={item} />
          ))}
        </nav>
      </div>
    </div>
  );
}
