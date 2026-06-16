import { PUBLIC_AUTHOR_PROFILE } from "@/modules/public/author-profile";
import { ABOUT_PAGE_CONTENT } from "@/modules/public/about-content";
import { AboutCtaLinks } from "./about-cta-links";
import { AboutProfileImage } from "./about-profile-image";

export function AboutPageContent() {
  const { hero, intro, audienceNote, sections } = ABOUT_PAGE_CONTENT;

  return (
    <div className="space-y-12">
      <section
        aria-labelledby="about-hero-heading"
        className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 lg:p-10"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start lg:gap-10">
          <figure className="mx-auto w-full max-w-[280px] lg:mx-0">
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-sm)]">
              <AboutProfileImage
                priority
                className="h-auto w-full object-cover object-center"
                sizes="(max-width: 1024px) 280px, 280px"
              />
            </div>
            <figcaption className="mt-4 text-center text-sm text-[var(--muted)] lg:text-left">
              <p className="font-medium text-[var(--foreground)]">{PUBLIC_AUTHOR_PROFILE.fullName}</p>
              <p className="mt-1">{hero.role}</p>
              <p className="mt-1">{hero.location}</p>
            </figcaption>
          </figure>

          <div className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--primary)] sm:tracking-[0.2em]">
              {hero.eyebrow}
            </p>
            <h1
              id="about-hero-heading"
              className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.5rem] lg:leading-tight"
            >
              {hero.headline}
            </h1>
            <p className="mt-4 text-lg font-medium leading-relaxed text-[var(--foreground)] text-pretty sm:text-xl">
              {hero.subheadline}
            </p>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              {intro.map((paragraph, index) => (
                <p key={index} className="text-pretty">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-8">
              <AboutCtaLinks />
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="about-audience-heading"
        className="rounded-xl border border-[var(--border)] bg-[var(--background)]/60 px-6 py-5 sm:px-8 sm:py-6"
      >
        <h2 id="about-audience-heading" className="sr-only">
          How I can contribute
        </h2>
        <p className="text-base leading-relaxed text-[var(--muted)] text-pretty sm:text-lg">
          {audienceNote}
        </p>
      </section>

      <section aria-labelledby="about-sections-heading">
        <h2 id="about-sections-heading" className="sr-only">
          Background and focus areas
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <li
              key={section.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)] sm:p-6"
            >
              <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-[var(--muted)] sm:text-base"
                  >
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
