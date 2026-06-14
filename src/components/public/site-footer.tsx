import type { BlogConfig } from "@/modules/public/blog-config";

export function SiteFooter({ config }: { config: BlogConfig }) {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} {config.title}</p>
        <p>
          <a href="/rss.xml" className="hover:text-[var(--primary)]">
            RSS
          </a>
        </p>
      </div>
    </footer>
  );
}
