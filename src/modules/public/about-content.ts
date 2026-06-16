import { PUBLIC_AUTHOR_PROFILE, PUBLIC_PROFILE_LINKS } from "./author-profile";

/** Repo-specific About page content for tgoliveira11-tech. */
export const ABOUT_PAGE_PATH = "/about" as const;

export const ABOUT_PROFILE_IMAGE = {
  src: "/images/about/thiago-oliveira.jpg",
  alt: "Thiago Oliveira — engineering leader and technology professional",
  width: 720,
  height: 720,
} as const;

export const ABOUT_PAGE_CONTENT = {
  metadata: {
    title: "About Thiago Oliveira",
    description:
      "Engineering leadership with hands-on technical depth. More than two decades across software architecture, delivery, cloud, and AI-enabled engineering.",
  },
  hero: {
    eyebrow: "Engineering leadership · Architecture · AI",
    headline: "Engineering leadership with hands-on technical depth",
    subheadline:
      "Technology, architecture, delivery, and AI — built on more than two decades in software",
    location: "Santos, São Paulo, Brazil",
    role: "Engineering Lead / Director",
  },
  intro: [
    `I'm ${PUBLIC_AUTHOR_PROFILE.name}, an engineering leader and technology professional with more than two decades of experience across software engineering, solution architecture, systems integration, cloud, delivery, and technical leadership. I work at the intersection of architecture, execution, and business outcomes — with a strong interest in how AI is reshaping the way modern software is built.`,
    "Over the years, I've worked across different business contexts, helping teams and organizations design better systems, make sound technical decisions, and deliver technology that is practical, scalable, and aligned with real goals. This blog is where I share notes, reflections, and lessons from that journey.",
  ],
  audienceNote:
    "I work best in environments that need technical leadership, architectural clarity, execution discipline, and thoughtful adoption of AI and modern engineering practices — whether that means scaling a product team, shaping platform decisions, or bridging engineering and business priorities.",
  sections: [
    {
      id: "what-i-do",
      title: "What I do",
      items: [
        "Engineering leadership",
        "Software and solution architecture",
        "AI-enabled product and engineering work",
        "Delivery and technical decision-making",
      ],
    },
    {
      id: "what-i-bring",
      title: "What I bring",
      items: [
        "20+ years in IT",
        "Hands-on technical depth",
        "Architectural thinking",
        "Pragmatism and cross-functional business awareness",
      ],
    },
    {
      id: "what-youll-find",
      title: "What you'll find here",
      items: [
        "Software architecture",
        "Engineering leadership",
        "AI and modern engineering",
        "Delivery, career, and technology reflections",
      ],
    },
    {
      id: "connect",
      title: "Connect",
      items: [
        "Open source and experiments on GitHub",
        "Professional background and writing on LinkedIn",
        "Long-form notes and articles on this blog",
      ],
    },
  ],
  ctas: {
    blog: { href: "/blog", label: "Read the blog" },
    about: { href: ABOUT_PAGE_PATH, label: "About me" },
    profileLinks: PUBLIC_PROFILE_LINKS,
  },
  preview: {
    title: "About me",
    description:
      "Engineering leader with hands-on technical depth — architecture, delivery, and AI across more than two decades in software.",
    ctaLabel: "Learn more about me",
  },
} as const;

export const ABOUT_SITEMAP_ENTRY = {
  path: ABOUT_PAGE_PATH,
  changeFrequency: "monthly" as const,
  priority: 0.7,
};
