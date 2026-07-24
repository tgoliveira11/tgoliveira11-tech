export type PublicProfileLink = {
  label: string;
  href: string;
};

/** Public author identity and profile links for the blog surface. */
export const PUBLIC_AUTHOR_PROFILE = {
  name: "Thiago Goulart de Oliveira",
  fullName: "Thiago Goulart de Oliveira",
  title: "Engineering Director",
  location: "Santos, Brazil",
  email: "thiago@tgoliveira11.tech",
  github: "https://github.com/tgoliveira11",
  linkedIn: "https://www.linkedin.com/in/tgoliveira",
  website: "https://tgoliveira11.tech",
} as const;

export type HomeHeroHighlight = {
  title: string;
  description: string;
};

export const HOME_HERO_CONTENT = {
  eyebrow: "Engineering Director · AI Platforms · Cloud & Solution Architecture",
  title: "Thiago Goulart de Oliveira",
  subtitle:
    "I write about building production AI systems, scalable architectures, engineering organizations, and technology-driven products.",
  secondaryParagraph:
    "The articles here focus on enterprise AI platforms, agentic systems, software and solution architecture, product engineering, technology strategy, and engineering leadership.",
  highlights: [
    {
      title: "Enterprise AI Platforms",
      description:
        "Production AI systems, agentic workflows, evaluation, observability, governance, and reliability.",
    },
    {
      title: "Architecture & Cloud",
      description:
        "Software, solution, and system architecture across distributed systems, APIs, security, and cloud.",
    },
    {
      title: "Leadership & Strategy",
      description:
        "Engineering management, product engineering, platform strategy, and technology-led business outcomes.",
    },
  ] satisfies HomeHeroHighlight[],
} as const;

export const PUBLIC_PROFILE_LINKS: PublicProfileLink[] = [
  { label: "LinkedIn", href: PUBLIC_AUTHOR_PROFILE.linkedIn },
  { label: "GitHub", href: PUBLIC_AUTHOR_PROFILE.github },
];
