"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home", match: (pathname: string) => pathname === "/" },
  {
    href: "/categories/ai-engineering",
    label: "AI Engineering",
    match: (pathname: string) => pathname === "/categories/ai-engineering",
  },
  {
    href: "/categories/software-solution-architecture",
    label: "Architecture",
    match: (pathname: string) => pathname === "/categories/software-solution-architecture",
  },
  {
    href: "/categories/engineering-leadership",
    label: "Leadership",
    match: (pathname: string) => pathname === "/categories/engineering-leadership",
  },
  {
    href: "/categories/technology-strategy",
    label: "Strategy",
    match: (pathname: string) => pathname === "/categories/technology-strategy",
  },
  {
    href: "/categories/career-reflections",
    label: "Reflections",
    match: (pathname: string) => pathname === "/categories/career-reflections",
  },
  { href: "/about", label: "About", match: (pathname: string) => pathname === "/about" },
  {
    href: "/blog",
    label: "Articles",
    match: (pathname: string) => pathname === "/blog" || pathname.startsWith("/blog/"),
  },
  { href: "/search", label: "Search", match: (pathname: string) => pathname === "/search", hideable: true },
] as const;

export function SiteNav({ hideSearchLink = false }: { hideSearchLink?: boolean }) {
  const pathname = usePathname();
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);

  const visibleLinks = NAV_LINKS.filter(
    (link) => !(hideSearchLink && "hideable" in link && link.hideable)
  );

  return (
    <nav aria-label="Main navigation" className="flex w-full flex-col items-end md:block">
      <button
        type="button"
        aria-controls={menuId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] md:hidden"
      >
        <span className="sr-only">Toggle navigation</span>
        <span aria-hidden="true" className="flex flex-col gap-1">
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
        </span>
      </button>

      <div id={menuId} className={`w-full ${isOpen ? "mt-3 block" : "hidden"} md:mt-0 md:block`}>
        <ul className="flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 shadow-[var(--shadow-sm)] md:flex-row md:flex-wrap md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none">
          {visibleLinks.map((link) => {
            const isActive = link.match(pathname);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                  className={`inline-flex w-full whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] md:w-auto md:px-3 md:py-1.5 ${
                    isActive
                      ? "bg-[var(--accent-muted)] text-[var(--primary)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
