import Link from "next/link";
import {
  PUBLIC_AUTHOR_PROFILE,
  RESUME_DOWNLOAD_FILENAME,
} from "@/modules/public/author-profile";
import { ABOUT_PAGE_CONTENT } from "@/modules/public/about-content";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-5 py-2.5 text-sm font-medium transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

export function AboutCtaLinks({
  showBlogLink = true,
  layout = "row",
  resumeSource = showBlogLink ? "about-hero" : "about-final-cta",
}: {
  showBlogLink?: boolean;
  layout?: "row" | "stack";
  resumeSource?: "about-hero" | "about-final-cta" | "home-about";
}) {
  const { blog, profileLinks } = ABOUT_PAGE_CONTENT.ctas;
  const linkedInLink = profileLinks.find((link) => link.label === "LinkedIn");
  const githubLink = profileLinks.find((link) => link.label === "GitHub");
  const containerClass =
    layout === "stack"
      ? "flex flex-col items-stretch gap-3"
      : "flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center";

  return (
    <div className={containerClass}>
      {showBlogLink ? (
        <Link
          href={blog.href}
          className={primaryButtonClass}
          data-analytics-event="about_work_cta_click"
          data-analytics-component="about_cta"
        >
          {blog.label}
        </Link>
      ) : null}
      {PUBLIC_AUTHOR_PROFILE.resumeUrl ? (
        <a
          href={PUBLIC_AUTHOR_PROFILE.resumeUrl}
          download={RESUME_DOWNLOAD_FILENAME}
          aria-label="Download Thiago Goulart de Oliveira résumé as a PDF"
          className={secondaryButtonClass}
          data-analytics-event="resume_download"
          data-analytics-component="about_cta"
          data-analytics-source={resumeSource}
          data-analytics-file={RESUME_DOWNLOAD_FILENAME}
        >
          Download résumé
        </a>
      ) : null}
      {linkedInLink ? (
        <a
          href={linkedInLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className={secondaryButtonClass}
          data-analytics-event="linkedin_cta_click"
          data-analytics-component="about_cta"
        >
          Connect on LinkedIn
        </a>
      ) : null}
      {githubLink ? (
        <a
          href={githubLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className={secondaryButtonClass}
          data-analytics-event="github_cta_click"
          data-analytics-component="about_cta"
        >
          View GitHub
        </a>
      ) : null}
    </div>
  );
}
