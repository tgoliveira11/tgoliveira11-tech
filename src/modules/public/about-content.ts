import { PUBLIC_AUTHOR_PROFILE, PUBLIC_PROFILE_LINKS } from "./author-profile";
import {
  PROFESSIONAL_AUTHOR_SUMMARY,
  PROFESSIONAL_HEADLINE,
  SITE_INTRODUCTION,
} from "./editorial-taxonomy";

/** Repo-specific About page content for tgoliveira11-tech. */
export const ABOUT_PAGE_PATH = "/about" as const;

export const ABOUT_PROFILE_IMAGE = {
  src: "/images/about/thiago-oliveira.png",
  alt: "Portrait of Thiago Goulart de Oliveira, Engineering Director.",
  width: 1254,
  height: 1254,
} as const;

export const ABOUT_PAGE_CONTENT = {
  metadata: {
    title: "About Thiago Goulart de Oliveira",
    description:
      "Engineering Director working across enterprise AI platforms, agentic systems, cloud architecture, product engineering, and engineering leadership.",
  },
  hero: {
    eyebrow: PROFESSIONAL_HEADLINE,
    headline: "Engineering leadership for AI platforms, architecture, and product engineering",
    subheadline: SITE_INTRODUCTION,
    location: "Santos, São Paulo, Brazil",
    role: PUBLIC_AUTHOR_PROFILE.title,
  },
  intro: [
    PROFESSIONAL_AUTHOR_SUMMARY,
    "This site collects practical writing on production AI systems, scalable software and solution architecture, engineering organizations, technology strategy, and the career lessons that come with long-running technical work.",
  ],
  audienceNote:
    "The work represented here sits at the intersection of technical leadership, architectural clarity, product engineering, enterprise AI adoption, and business-aligned technology decisions.",
  sections: [
    {
      id: "what-i-do",
      title: "What I do",
      items: [
        "Engineering leadership",
        "Enterprise AI platforms and agentic systems",
        "Software, solution, and cloud architecture",
        "Product engineering and technology strategy",
      ],
    },
    {
      id: "what-i-bring",
      title: "What I bring",
      items: [
        "24 years of professional reinvention",
        "Hands-on technical depth and architectural thinking",
        "Cloud and platform perspective",
        "Cross-functional business awareness",
      ],
    },
    {
      id: "what-youll-find",
      title: "What you'll find here",
      items: [
        "AI engineering and LLM-enabled systems",
        "Software and solution architecture",
        "Engineering leadership and management",
        "Technology strategy, product engineering, and career reflections",
      ],
    },
    {
      id: "connect",
      title: "Connect",
      items: [
        "Professional discussion on LinkedIn",
        "Open source and experiments on GitHub",
        "Long-form notes and articles on this blog",
      ],
    },
  ],
  ctas: {
    blog: { href: "/blog", label: "Read articles" },
    about: { href: ABOUT_PAGE_PATH, label: "About me" },
    profileLinks: PUBLIC_PROFILE_LINKS,
  },
  preview: {
    title: "About me",
    description:
      "Engineering Director working across enterprise AI platforms, agentic systems, cloud architecture, product engineering, and engineering leadership.",
    ctaLabel: "Learn more about me",
  },
} as const;

export const ABOUT_SITEMAP_ENTRY = {
  path: ABOUT_PAGE_PATH,
  changeFrequency: "monthly" as const,
  priority: 0.7,
};
