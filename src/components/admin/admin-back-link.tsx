import Link from "next/link";
import { ArrowLeftIcon } from "@/components/admin/admin-icons";

export function AdminBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
    >
      <ArrowLeftIcon />
      <span>{label}</span>
    </Link>
  );
}
