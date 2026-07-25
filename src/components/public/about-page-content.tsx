import { PUBLIC_AUTHOR_PROFILE } from "@/modules/public/author-profile";
import { ABOUT_PAGE_CONTENT } from "@/modules/public/about-content";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";
import { AboutCtaLinks } from "./about-cta-links";
import { AboutProfileImage } from "./about-profile-image";
import { PostList } from "./post-list";

export function AboutPageContent({
  selectedInsights = [],
}: {
  selectedInsights?: PublicPostBundle[];
}) {
  const {
    hero,
    intro,
    audienceNote,
    professionalSummary,
    coreAreas,
    careerProgression,
    sections,
    leadershipPrinciples,
    selectedWork,
    finalCta,
  } = ABOUT_PAGE_CONTENT;

  return (
    <div className="space-y-12">
      <section
        aria-labelledby="about-hero-heading"
        className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-8 lg:p-10"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start lg:gap-10">
          <figure className="mx-auto w-full max-w-[220px] sm:max-w-[260px] lg:mx-0">
            <div className="aspect-square w-full overflow-hidden rounded-full bg-[var(--background)] shadow-[var(--shadow-sm)]">
              <AboutProfileImage
                priority
                className="h-full w-full rounded-full object-cover object-center"
                sizes="(max-width: 1024px) 260px, 260px"
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
              className="mt-4 break-words text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.5rem] lg:leading-tight"
            >
              {hero.headline}
            </h1>
            <p className="mt-4 text-lg font-medium leading-relaxed text-[var(--foreground)] text-pretty sm:text-xl">
              {hero.subheadline}
            </p>
            <div className="mt-6 max-w-3xl space-y-5 text-base leading-8 text-[var(--muted)] sm:text-lg">
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
        aria-labelledby="about-summary-heading"
        className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start"
      >
        <div className="max-w-xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--primary)]">
            Professional summary
          </p>
          <h2
            id="about-summary-heading"
            className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {professionalSummary.heading}
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--muted)] text-pretty">
            {audienceNote}
          </p>
        </div>
        <div className="max-w-3xl space-y-5 text-base leading-8 text-[var(--muted)]">
          {professionalSummary.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-pretty">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section aria-labelledby="about-core-areas-heading">
        <h2
          id="about-core-areas-heading"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Core areas
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {coreAreas.map((area) => (
            <li
              key={area.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)] sm:p-6"
            >
              <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                {area.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                {area.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="about-career-heading"
        className="rounded-xl border border-[var(--border)] bg-[var(--background)]/60 p-6 sm:p-8"
      >
        <h2
          id="about-career-heading"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {careerProgression.heading}
        </h2>
        <p className="mt-5 text-base font-medium leading-relaxed text-[var(--foreground)]">
          {careerProgression.sequence}
        </p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--muted)] text-pretty">
          {careerProgression.description}
        </p>
      </section>

      {selectedInsights.length > 0 ? (
        <section aria-labelledby="about-selected-work-heading">
          <div className="mb-6">
            <h2
              id="about-selected-work-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              {selectedWork.heading}
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--muted)]">
              {selectedWork.description}
            </p>
          </div>
          <PostList
            posts={selectedInsights}
            layout="grid"
            variant="compact"
            maxTags={3}
            showPromotionBadges={false}
            analyticsEvent="about_selected_work_click"
            analyticsComponent="about_selected_work"
          />
        </section>
      ) : null}

      <section aria-labelledby="about-principles-heading">
        <h2
          id="about-principles-heading"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Leadership principles
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {leadershipPrinciples.map((principle) => (
            <li
              key={principle.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)] sm:p-6"
            >
              <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                {principle.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                {principle.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="about-experience-heading">
        <h2
          id="about-experience-heading"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Areas of technical experience
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
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

      <section
        aria-labelledby="about-final-cta-heading"
        className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-sm)] sm:p-8"
      >
        <h2
          id="about-final-cta-heading"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {finalCta.heading}
        </h2>
        <div className="mt-4 max-w-3xl space-y-3 text-base leading-relaxed text-[var(--muted)]">
          {finalCta.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-pretty">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="mt-6">
          <AboutCtaLinks showBlogLink={false} />
        </div>
      </section>
    </div>
  );
}
