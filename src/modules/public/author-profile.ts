export type PublicProfileLink = {
  label: string;
  href: string;
};

/** Public author identity and profile links for the blog surface. */
export const PUBLIC_AUTHOR_PROFILE = {
  name: "Thiago Oliveira",
  fullName: "Thiago Goulart de Oliveira",
  location: "Santos, Brazil",
  github: "https://github.com/tgoliveira11",
  linkedIn: "https://www.linkedin.com/in/tgoliveira",
  website: "https://tgoliveira11.tech",
} as const;

export type HomeHeroHighlight = {
  title: string;
  description: string;
};

export const HOME_HERO_CONTENT = {
  eyebrow: "Personal blog · Software architecture · Engineering leadership · AI",
  title: "Hi, I'm Thiago Oliveira.",
  subtitle:
    "I write about software architecture, engineering leadership, AI, delivery, career decisions, and the lessons learned from more than two decades building technology across different business contexts.",
  secondaryParagraph:
    "This is where I organize technical notes, reflections, experiments, and practical ideas from my journey as an engineer, architect, and technology leader.",
  highlights: [
    {
      title: "Architecture & Engineering",
      description:
        "Notes on systems, APIs, integrations, cloud, security, and maintainable software.",
    },
    {
      title: "Leadership & Delivery",
      description:
        "Reflections on leading teams, making technical decisions, and delivering real business outcomes.",
    },
    {
      title: "AI & Technology",
      description:
        "Experiments and thoughts on AI, developer productivity, and the future of software work.",
    },
  ] satisfies HomeHeroHighlight[],
} as const;

export const PUBLIC_PROFILE_LINKS: PublicProfileLink[] = [
  { label: "GitHub", href: PUBLIC_AUTHOR_PROFILE.github },
  { label: "LinkedIn", href: PUBLIC_AUTHOR_PROFILE.linkedIn },
];
