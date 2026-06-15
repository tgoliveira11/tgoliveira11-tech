import Link from "next/link";
import {
  HOME_HERO_CONTENT,
  PUBLIC_AUTHOR_PROFILE,
  PUBLIC_PROFILE_LINKS,
} from "@/modules/public/author-profile";
import { SearchForm } from "./search-form";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-5 py-2.5 text-sm font-medium transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

const textLinkClass =
  "text-sm font-medium text-[var(--primary)] underline-offset-4 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

export function HomeHero({ primaryPostsHref }: { primaryPostsHref: string }) {
  const [githubLink, linkedInLink] = PUBLIC_PROFILE_LINKS;

  return (
    <section
      aria-labelledby="home-hero-heading"
      className="public-hero relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-10 sm:px-10 sm:py-12 lg:py-14"
    >
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="text-center lg:text-left">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--primary)] sm:tracking-[0.2em]">
            {HOME_HERO_CONTENT.eyebrow}
          </p>
          <h1
            id="home-hero-heading"
            className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
          >
            {HOME_HERO_CONTENT.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[var(--muted)] sm:text-xl text-pretty">
            {HOME_HERO_CONTENT.subtitle}
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--muted)] sm:text-lg text-pretty lg:max-w-none">
            {HOME_HERO_CONTENT.secondaryParagraph}
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-start">
            <Link href={primaryPostsHref} className={primaryButtonClass}>
              Read latest posts
            </Link>
            {githubLink ? (
              <a
                href={githubLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryButtonClass}
              >
                {githubLink.label}
              </a>
            ) : null}
            {linkedInLink ? (
              <a
                href={linkedInLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${textLinkClass} px-1 py-2.5 sm:ml-1`}
              >
                {linkedInLink.label}
              </a>
            ) : null}
          </div>

          <div className="mt-8 max-w-xl text-left lg:max-w-2xl">
            <SearchForm variant="hero" />
          </div>
        </div>

        <ul
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
          aria-label="Topics covered on this blog"
        >
          {HOME_HERO_CONTENT.highlights.map((highlight) => (
            <li
              key={highlight.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)]/80 p-5 text-left shadow-[var(--shadow-sm)]"
            >
              <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
                {highlight.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {highlight.description}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-sm text-[var(--muted)] lg:text-left">
          Based in {PUBLIC_AUTHOR_PROFILE.location}.
        </p>
      </div>
    </section>
  );
}
