import { PUBLIC_AUTHOR_PROFILE, PUBLIC_PROFILE_LINKS } from "./author-profile";

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
    title: "About Thiago Goulart de Oliveira | Engineering Director & AI Platform Leader",
    description:
      "Engineering Director with 24+ years of experience in enterprise AI platforms, solution architecture, cloud-native systems, product engineering, and engineering leadership.",
    ogTitle: "Thiago Goulart de Oliveira — Engineering Director",
    ogDescription:
      "Engineering leadership, enterprise AI platforms, cloud and solution architecture, product engineering, and technology strategy.",
  },
  hero: {
    eyebrow: "ABOUT",
    headline: "Engineering leadership grounded in architecture, product, and business.",
    subheadline:
      "I am an Engineering Director with 24+ years of experience across software engineering, solution architecture, product development, cloud platforms, entrepreneurship, and engineering management.",
    location: "Based in Brazil. Working with distributed and international teams across the Americas.",
    role: PUBLIC_AUTHOR_PROFILE.title,
  },
  intro: [
    "I currently lead the architecture and engineering delivery of enterprise AI products, including conversational and agent-based systems that combine LLM orchestration, structured data, APIs, Text-to-SQL, and cloud-native deployment.",
  ],
  audienceNote:
    "I work where engineering leadership, architecture, enterprise AI, and product strategy meet accountable execution.",
  professionalSummary: {
    heading: "Technology, teams, and accountable execution",
    paragraphs: [
      "My career has developed at the intersection of engineering, architecture, product, and business.",
      "I started as a software engineer, moved into solution architecture and project leadership, and later became Managing Director of a technology company and its B2B mobility product. That experience expanded my responsibilities beyond software: product strategy, operations, commercial priorities, fundraising, organizational growth, customer commitments, and the consequences of technical decisions.",
      "I later returned to hands-on architecture and engineering consulting, designing cloud, integration, and data solutions across AWS, Azure, and Oracle Cloud Infrastructure. Today, I lead engineering work around enterprise AI platforms and agentic systems.",
      "This path shaped how I approach technology leadership. I value technical depth, but I do not treat architecture as an isolated technical exercise. Systems must be secure, operable, financially responsible, understandable by the teams building them, and connected to a real business outcome.",
    ],
  },
  coreAreas: [
    {
      title: "Enterprise AI Platforms",
      description:
        "Conversational AI, agentic systems, LLM orchestration, Text-to-SQL, governed enterprise data, evaluation, observability, and production reliability.",
    },
    {
      title: "Engineering Leadership",
      description:
        "Engineering strategy, team development, coaching, technical standards, cross-functional alignment, delivery systems, and organizational effectiveness.",
    },
    {
      title: "Cloud & Solution Architecture",
      description:
        "Cloud-native systems, distributed architectures, APIs, enterprise integration, data platforms, security, resilience, and multi-cloud environments.",
    },
    {
      title: "Product & Technology Strategy",
      description:
        "Product engineering, business and technology alignment, commercialization, platform evolution, organizational scaling, and pragmatic technical decision-making.",
    },
  ],
  careerProgression: {
    heading: "A career built through multiple perspectives",
    sequence:
      "Software Engineer -> Technical Lead -> Solutions Architect -> Project Manager -> Managing Director -> Senior Solutions Architect -> Engineering Director",
    description:
      "Each role added a different operating context: building software, designing solutions, leading delivery, owning product and business consequences, and guiding engineering work across enterprise AI and architecture.",
  },
  sections: [
    {
      id: "ai-intelligent-systems",
      title: "AI and intelligent systems",
      items: [
        "Enterprise AI platforms",
        "Agentic systems",
        "LLM orchestration",
        "Text-to-SQL",
        "AI evaluation and observability",
      ],
    },
    {
      id: "architecture-distributed-systems",
      title: "Architecture and distributed systems",
      items: [
        "Software, solution, and system architecture",
        "Distributed systems",
        "APIs and enterprise integration",
        "Security and reliability",
        "Architecture governance",
      ],
    },
    {
      id: "cloud-data-delivery",
      title: "Cloud, data, and delivery",
      items: [
        "AWS, Microsoft Azure, and Oracle Cloud Infrastructure",
        "Cloud-native deployment",
        "Structured enterprise data",
        "Data governance",
        "Delivery systems and operational readiness",
      ],
    },
    {
      id: "software-engineering-foundations",
      title: "Software engineering foundations",
      items: [
        "Software engineering",
        "Product engineering",
        "Technical leadership",
        "Team development",
        "Technology strategy",
      ],
    },
  ],
  leadershipPrinciples: [
    {
      title: "Context before solutions",
      description:
        "A technically correct solution can still be the wrong solution when it ignores the business objective, operating environment, team capability, or cost.",
    },
    {
      title: "Explicit trade-offs",
      description:
        "Every architecture decision creates constraints. Good leadership makes those trade-offs visible instead of presenting decisions as universally correct.",
    },
    {
      title: "Autonomy with clear standards",
      description:
        "Teams perform better when they understand the outcome, the boundaries, and the standards - and have space to decide how to deliver.",
    },
    {
      title: "Operability is part of the design",
      description:
        "Reliability, observability, security, cost, support, and incident response should be designed with the product, not added after development.",
    },
    {
      title: "Continuous learning without trend chasing",
      description:
        "New technologies matter when they improve a real system or business outcome. Adoption should be guided by evidence, not novelty.",
    },
  ],
  selectedWork: {
    heading: "Selected work and writing",
    description:
      "A focused set of articles on production AI, architecture, product engineering, and career reinvention.",
  },
  finalCta: {
    heading: "Building systems and organizations that can evolve",
    paragraphs: [
      "I am interested in engineering leadership and architecture opportunities involving enterprise AI, cloud platforms, distributed systems, product engineering, and organizational growth.",
      "For professional conversations, connect with me on LinkedIn, explore selected work, or use the existing contact links.",
    ],
  },
  ctas: {
    blog: { href: "/blog", label: "View my work" },
    about: { href: ABOUT_PAGE_PATH, label: "About me" },
    profileLinks: PUBLIC_PROFILE_LINKS,
  },
  preview: {
    title: "About Thiago",
    description:
      "Engineering Director working across enterprise AI platforms, agentic systems, cloud architecture, product engineering, and engineering leadership.",
    ctaLabel: "View professional background",
  },
} as const;

export const ABOUT_SITEMAP_ENTRY = {
  path: ABOUT_PAGE_PATH,
  changeFrequency: "monthly" as const,
  priority: 0.7,
};
