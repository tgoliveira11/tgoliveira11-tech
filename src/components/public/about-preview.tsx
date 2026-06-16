import Link from "next/link";
import { ABOUT_PAGE_CONTENT } from "@/modules/public/about-content";
import { AboutProfileImage } from "./about-profile-image";

export function AboutPreview() {
  const { preview, ctas } = ABOUT_PAGE_CONTENT;

  return (
    <section
      aria-labelledby="about-preview-heading"
      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8"
    >
      <div className="grid gap-6 sm:grid-cols-[minmax(0,140px)_minmax(0,1fr)] sm:items-center sm:gap-8">
        <div className="mx-auto w-full max-w-[140px] sm:mx-0">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-sm)]">
            <AboutProfileImage
              className="h-auto w-full object-cover object-center"
              sizes="140px"
            />
          </div>
        </div>

        <div className="min-w-0 text-center sm:text-left">
          <h2 id="about-preview-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {preview.title}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--muted)] text-pretty sm:text-lg">
            {preview.description}
          </p>
          <Link
            href={ctas.about.href}
            className="mt-5 inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-5 py-2.5 text-sm font-medium transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            {preview.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
