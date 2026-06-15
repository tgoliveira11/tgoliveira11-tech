import Link from "next/link";
import type { BlogConfig } from "@/modules/public/blog-config";
import { SearchForm } from "./search-form";

export function HomeHero({ config }: { config: BlogConfig }) {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="public-hero relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-10 sm:px-10 sm:py-12"
    >
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--primary)]">
          Welcome
        </p>
        <h1 id="home-hero-heading" className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {config.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--muted)] sm:text-xl">
          {config.description}
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            Read the blog
          </Link>
          <Link
            href="/tags"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-5 py-2.5 text-sm font-medium transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            Browse topics
          </Link>
        </div>
        <div className="mt-8 text-left">
          <SearchForm variant="hero" />
        </div>
      </div>
    </section>
  );
}
