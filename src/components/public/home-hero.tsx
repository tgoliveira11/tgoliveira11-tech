import Link from "next/link";
import { HOME_HERO_CONTENT, PUBLIC_PROFILE_LINKS } from "@/modules/public/author-profile";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-5 py-2.5 text-sm font-medium transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

export function HomeHero({ primaryPostsHref }: { primaryPostsHref: string }) {
  const linkedInLink = PUBLIC_PROFILE_LINKS.find((link) => link.label === "LinkedIn");

  return (
    <section
      aria-labelledby="home-hero-heading"
      className="public-hero relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-7 sm:rounded-2xl sm:px-10 sm:py-12 lg:py-14"
    >
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="text-center lg:text-left">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--primary)] sm:tracking-[0.2em]">
            {HOME_HERO_CONTENT.eyebrow}
          </p>
          <h1
            id="home-hero-heading"
            className="mt-4 break-words text-[2rem] font-semibold leading-tight tracking-tight text-balance sm:text-5xl"
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
            <Link
              href={primaryPostsHref}
              className={`${primaryButtonClass} min-w-0`}
              data-analytics-event="home_explore_work_click"
              data-analytics-component="home_hero"
            >
              Explore my work
            </Link>
            <Link
              href="/about"
              className={`${secondaryButtonClass} min-w-0`}
              data-analytics-event="about_cta_click"
              data-analytics-component="home_hero"
            >
              About me
            </Link>
            {linkedInLink ? (
              <a
                href={linkedInLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${secondaryButtonClass} min-w-0`}
                data-analytics-event="linkedin_cta_click"
                data-analytics-component="home_hero"
              >
                Connect on LinkedIn
              </a>
            ) : null}
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
      </div>
    </section>
  );
}
