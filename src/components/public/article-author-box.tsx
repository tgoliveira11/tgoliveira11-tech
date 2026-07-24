import Link from "next/link";
import { PUBLIC_AUTHOR_PROFILE } from "@/modules/public/author-profile";
import {
  LINKEDIN_CTA_LABEL,
  PROFESSIONAL_AUTHOR_SUMMARY,
} from "@/modules/public/editorial-taxonomy";

export function ArticleAuthorBox() {
  return (
    <aside
      aria-labelledby="article-author-heading"
      className="mt-12 border-t border-[var(--border)] pt-8"
    >
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)]">
        <h2 id="article-author-heading" className="text-lg font-semibold tracking-tight">
          About {PUBLIC_AUTHOR_PROFILE.fullName}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          {PROFESSIONAL_AUTHOR_SUMMARY}
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link
            href="/about"
            className="inline-flex text-sm font-medium text-[var(--primary)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            data-analytics-event="article_author_about_click"
            data-analytics-component="article_author_box"
          >
            About the author
          </Link>
          <a
            href={PUBLIC_AUTHOR_PROFILE.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-medium text-[var(--primary)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            data-analytics-event="article_cta_click"
            data-analytics-component="article_author_box"
          >
            {LINKEDIN_CTA_LABEL}
          </a>
        </div>
      </div>
    </aside>
  );
}
