import type { Category } from "@/modules/categories/categories.types";
import type { Post } from "@/modules/posts/posts.types";
import { normalizeSlug } from "@/modules/posts/slug";
import type { Tag } from "@/modules/tags/tags.types";

export const SITE_NAME = "Thiago Goulart de Oliveira";
export const PROFESSIONAL_HEADLINE =
  "Engineering Director · AI Platforms · Cloud & Solution Architecture";
export const SITE_INTRODUCTION =
  "I write about building production AI systems, scalable architectures, engineering organizations, and technology-driven products.";
export const PROFESSIONAL_AUTHOR_TITLE = "Engineering Director";
export const PROFESSIONAL_AUTHOR_SUMMARY =
  "Thiago Goulart de Oliveira is an Engineering Director working across enterprise AI platforms, agentic systems, cloud architecture, product engineering, and engineering leadership.";
export const LINKEDIN_CTA_LABEL = "Continue the discussion on LinkedIn.";

export const EDITORIAL_CATEGORIES = [
  {
    name: "AI Engineering",
    slug: "ai-engineering",
    navLabel: "AI Engineering",
    description:
      "Production AI systems, agentic workflows, enterprise data, evaluation, governance, observability, and reliability.",
  },
  {
    name: "Software & Solution Architecture",
    slug: "software-solution-architecture",
    navLabel: "Architecture",
    description:
      "Software design, distributed systems, cloud architecture, integration, APIs, security, and architectural decision-making.",
  },
  {
    name: "Engineering Leadership",
    slug: "engineering-leadership",
    navLabel: "Engineering Leadership",
    description:
      "Engineering organizations, people management, team development, delivery systems, technical standards, and organizational effectiveness.",
  },
  {
    name: "Technology Strategy",
    slug: "technology-strategy",
    navLabel: "Technology Strategy",
    description:
      "Product engineering, business and technology alignment, platform strategy, commercialization, and digital products.",
  },
  {
    name: "Career & Reflections",
    slug: "career-reflections",
    navLabel: "Reflections",
    description:
      "Career development, professional reinvention, culture, learning, and personal reflections.",
  },
] as const;

export type EditorialCategory = (typeof EDITORIAL_CATEGORIES)[number];
export type EditorialCategorySlug = EditorialCategory["slug"];

export const EDITORIAL_CATEGORY_BY_SLUG: ReadonlyMap<string, EditorialCategory> = new Map(
  EDITORIAL_CATEGORIES.map((category) => [category.slug, category])
);

const EPOCH_DATE = new Date(0);

export function getEditorialCategoryBySlug(slug: string): EditorialCategory | undefined {
  return EDITORIAL_CATEGORY_BY_SLUG.get(slug);
}

export function isEditorialCategorySlug(slug: string): slug is EditorialCategorySlug {
  return EDITORIAL_CATEGORY_BY_SLUG.has(slug);
}

export function toCategoryRecord(category: EditorialCategory): Category {
  return {
    id: `editorial-${category.slug}`,
    name: category.name,
    slug: category.slug,
    description: category.description,
    createdAt: EPOCH_DATE,
    updatedAt: EPOCH_DATE,
  };
}

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

export function taxonomyAliasKey(value: string | null | undefined): string {
  return stripDiacritics(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function kebabCaseTaxonomyValue(value: string): string {
  const ascii = stripDiacritics(value)
    .replace(/&/g, " and ")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2");

  return normalizeSlug(ascii);
}

export const CATEGORY_SLUG_ALIASES: Record<string, EditorialCategorySlug> = {
  ai: "ai-engineering",
  artificialintelligence: "ai-engineering",
  technologyarchitecture: "software-solution-architecture",
  architecture: "software-solution-architecture",
  softwarearchitecture: "software-solution-architecture",
  solutionarchitecture: "software-solution-architecture",
  systemarchitecture: "software-solution-architecture",
  cybersecurity: "software-solution-architecture",
  websecurity: "software-solution-architecture",
  technologyleadership: "engineering-leadership",
  leadership: "engineering-leadership",
  management: "engineering-leadership",
  professionalgrowth: "career-reflections",
  personaldevelopment: "career-reflections",
  reflectionssociety: "career-reflections",
  reflections: "career-reflections",
  career: "career-reflections",
  technologystrategy: "technology-strategy",
  productstrategy: "technology-strategy",
};

export function canonicalizeCategorySlug(value: string): EditorialCategorySlug | string {
  const slug = kebabCaseTaxonomyValue(value);
  if (isEditorialCategorySlug(slug)) {
    return slug;
  }

  return CATEGORY_SLUG_ALIASES[taxonomyAliasKey(value)] ?? slug;
}

export const TAG_SLUG_ALIASES: Record<string, string> = {
  apisecurity: "api-security",
  api: "api",
  apiarchitecture: "api-architecture",
  apidesign: "api-design",
  apigateway: "api-gateway",
  apikeys: "api-keys",
  apimanagement: "api-management",
  apis: "apis",
  restapis: "rest-apis",
  sastdast: "sast-dast",
  texttosql: "text-to-sql",
  llmops: "llmops",
  aiobservability: "ai-observability",
  responsibleai: "responsible-ai",
  enterpriseai: "enterprise-ai",
  generativeai: "generative-ai",
  agenticai: "agentic-ai",
  agenticsystems: "agentic-systems",
  artificialintelligence: "artificial-intelligence",
  humanandai: "human-and-ai",
  aitools: "ai-tools",
  softwarearchitecture: "software-architecture",
  solutionarchitecture: "solution-architecture",
  systemarchitecture: "system-architecture",
  enterprisearchitecture: "enterprise-architecture",
  architecturegovernance: "architecture-governance",
  systemdesign: "system-design",
  systemsdesign: "systems-design",
  architecturedesign: "architecture-design",
  architecturepatterns: "architecture-patterns",
  architecturalpatterns: "architectural-patterns",
  architecturalstyles: "architectural-styles",
  technicalarchitecture: "technical-architecture",
  technicalleadership: "technical-leadership",
  technologyleadership: "technology-leadership",
  engineeringleadership: "engineering-leadership",
  softwareengineering: "software-engineering",
  softwaredevelopment: "software-development",
  softwaredesign: "software-design",
  softwarepatterns: "software-patterns",
  softwaresystems: "software-systems",
  softwaresolutions: "software-solutions",
  cleanarchitecture: "clean-architecture",
  cleancode: "clean-code",
  cloudarchitecture: "cloud-architecture",
  cloudcomputing: "cloud-computing",
  cloudbestpractices: "cloud-best-practices",
  cloudmigration: "cloud-migration",
  cloudmonitoring: "cloud-monitoring",
  cloudservices: "cloud-services",
  clouddatabases: "cloud-databases",
  dataarchitecture: "data-architecture",
  datadrivensystems: "data-driven-systems",
  datagovernance: "data-governance",
  dataengineering: "data-engineering",
  datamanagement: "data-management",
  dataperformance: "data-performance",
  dataprivacy: "data-privacy",
  dataprotection: "data-protection",
  dataprocessing: "data-processing",
  databasedesign: "database-design",
  databasearchitecture: "database-architecture",
  databaseperformance: "database-performance",
  databasescaling: "database-scaling",
  digitaltransformation: "digital-transformation",
  productengineering: "product-engineering",
  productstrategy: "product-strategy",
  b2bplatform: "b2b-platform",
  saasdevelopment: "saas-development",
  fullstackdevelopment: "full-stack-development",
  developertools: "developer-tools",
  developercommunity: "developer-community",
  developerproductivity: "developer-productivity",
  communitydrivenlearning: "community-driven-learning",
  collaborativelearning: "collaborative-learning",
  continuouslearning: "continuous-learning",
  continuousimprovement: "continuous-improvement",
  personaldevelopment: "personal-development",
  professionaldevelopment: "professional-development",
  professionalgrowth: "professional-growth",
  careerreflection: "career-reflection",
  careerjourney: "career-journey",
  careergrowth: "career-growth",
  careeradvancement: "career-advancement",
  corporateculture: "corporate-culture",
  organizationalculture: "organizational-culture",
  workplaceculture: "workplace-culture",
  teamdevelopment: "team-development",
  teamscaling: "team-scaling",
  teamcollaboration: "team-collaboration",
  teamcommunication: "team-communication",
  remotework: "remote-work",
  remoteteams: "remote-teams",
  remoteleadership: "remote-leadership",
  remotecollaboration: "remote-collaboration",
  remoteculture: "remote-culture",
  remoteproductivity: "remote-productivity",
  worklifebalance: "work-life-balance",
  wellbeing: "well-being",
  employeewellbeing: "employee-wellbeing",
  burnoutprevention: "burnout-prevention",
  highperformance: "high-performance",
  humanpotential: "human-potential",
  mentalenergy: "mental-energy",
  personalenergy: "personal-energy",
  physicalenergy: "physical-energy",
  sustainableperformance: "sustainable-performance",
  eventdrivenarchitecture: "event-driven-architecture",
  domaindrivendesign: "domain-driven-design",
  dependencyinjection: "dependency-injection",
  dependencyinversionprinciple: "dependency-inversion-principle",
  dependencymanagement: "dependency-management",
  designpatterns: "design-patterns",
  designprinciples: "design-principles",
  distributedarchitecture: "distributed-architecture",
  distributedapplications: "distributed-applications",
  distributeddatabases: "distributed-databases",
  distributedcaching: "distributed-caching",
  distributedsystems: "distributed-systems",
  monolithtomicroservices: "monolith-to-microservices",
  microservices: "microservices",
  servicecommunication: "service-communication",
  synchronouscommunication: "synchronous-communication",
  asynchronouscommunication: "asynchronous-communication",
  asynchronousmessaging: "asynchronous-messaging",
  asynchronousprocessing: "asynchronous-processing",
  asynchronousprogramming: "asynchronous-programming",
  systemintegration: "system-integration",
  systemflexibility: "system-flexibility",
  systemresilience: "system-resilience",
  systemreliability: "system-reliability",
  systemscalability: "system-scalability",
  csharp: "csharp",
  dotnet: "dotnet",
  dotnetcore: "dotnet-core",
  postgresql: "postgresql",
  drizzleorm: "drizzle-orm",
  nextauth: "next-auth",
  nextjs: "nextjs",
  typescript: "typescript",
  webauthn: "webauthn",
  twofactorauthentication: "two-factor-authentication",
  rateLimiting: "rate-limiting",
  ratelimiting: "rate-limiting",
  accesscontrol: "access-control",
  applicationsecurity: "application-security",
  authenticationsecurity: "authentication-security",
  tokenbasedauthentication: "token-based-authentication",
  staticapplicationsecuritytesting: "static-application-security-testing",
  dynamicapplicationsecuritytesting: "dynamic-application-security-testing",
  securitypipeline: "security-pipeline",
  securitytesting: "security-testing",
  securityassessment: "security-assessment",
  securecoding: "secure-coding",
  securesdlc: "secure-sdlc",
  sensitiveDataProtection: "sensitive-data-protection",
  sensitivedataprotection: "sensitive-data-protection",
  sourcecodemanagement: "source-code-management",
  sourcecontrol: "source-control",
  versioncontrol: "version-control",
};

export function canonicalizeTagSlug(value: string): string {
  return TAG_SLUG_ALIASES[taxonomyAliasKey(value)] ?? kebabCaseTaxonomyValue(value);
}

export function canonicalTagName(value: string): string {
  return canonicalizeTagSlug(value);
}

export function canonicalizeTag(tag: Tag): Tag {
  const canonicalSlug = canonicalizeTagSlug(tag.name || tag.slug);
  return {
    ...tag,
    name: canonicalTagName(tag.name || tag.slug),
    slug: canonicalSlug,
  };
}

export function canonicalizeTagList(tags: Tag[]): Tag[] {
  const bySlug = new Map<string, Tag>();

  for (const tag of tags) {
    const canonical = canonicalizeTag(tag);
    if (!canonical.slug || bySlug.has(canonical.slug)) {
      continue;
    }
    bySlug.set(canonical.slug, canonical);
  }

  return [...bySlug.values()].sort((left, right) => left.slug.localeCompare(right.slug));
}

function stripDatePrefix(slug: string): string {
  return slug.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

export function getPostTaxonomyKey(post: Pick<Post, "slug" | "title">): string {
  const slugKey = stripDatePrefix(post.slug);
  return slugKey || kebabCaseTaxonomyValue(post.title);
}

const POST_CATEGORY_OVERRIDES: Record<string, EditorialCategorySlug> = {
  "what-breaks-first-when-text-to-sql-moves-from-demo-to-production": "ai-engineering",
  "text-to-sql-from-demo-to-production": "ai-engineering",
  "stack-overflow-ai": "ai-engineering",
  "software-solution-system-architecture": "software-solution-architecture",
  "opinionated-authentication-foundation": "software-solution-architecture",
  "git-ignore": "software-solution-architecture",
  "in-memory-cache": "software-solution-architecture",
  "scalability-sharding": "software-solution-architecture",
  "microservices-functions": "software-solution-architecture",
  "monitoring-microservices": "software-solution-architecture",
  "assessments": "software-solution-architecture",
  "sast-dast": "software-solution-architecture",
  "di-modern-coding": "software-solution-architecture",
  "solid-charp": "software-solution-architecture",
  "monolithic-to-ddd": "software-solution-architecture",
  "event-driven-microservices": "software-solution-architecture",
  "architecture-design-patterns": "software-solution-architecture",
  "api-security": "software-solution-architecture",
  "remote-work": "engineering-leadership",
  "become-to-achieve": "engineering-leadership",
  "building-scaling-b2b-mobility-platform": "technology-strategy",
  "building-and-scaling-a-b2b-mobility-platform": "technology-strategy",
  "from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform":
    "technology-strategy",
  "a-letter-to-my-past-self": "career-reflections",
  "where-there-is-smoke-there-is-fire": "career-reflections",
  "universal-energy-into-personal-achievements": "career-reflections",
};

const AI_TAGS = new Set([
  "ai-engineering",
  "ai-tools",
  "agentic-ai",
  "agentic-systems",
  "artificial-intelligence",
  "enterprise-ai",
  "generative-ai",
  "human-and-ai",
  "llmops",
  "responsible-ai",
  "text-to-sql",
]);

const STRATEGY_TAGS = new Set([
  "b2b-platform",
  "digital-transformation",
  "entrepreneurship",
  "fintech",
  "mobility",
  "product-engineering",
  "product-strategy",
  "saas-development",
  "startup-experience",
  "technology-strategy",
]);

const LEADERSHIP_TAGS = new Set([
  "corporate-culture",
  "engineering-leadership",
  "leadership",
  "mentorship",
  "organizational-culture",
  "remote-leadership",
  "remote-teams",
  "team-development",
  "team-scaling",
  "workplace-culture",
]);

const CAREER_TAGS = new Set([
  "career-advancement",
  "career-growth",
  "career-journey",
  "career-reflection",
  "continuous-learning",
  "life-reflections",
  "personal-development",
  "personal-energy",
  "professional-growth",
  "unconventional-paths",
]);

export function resolveEditorialCategoryForPost(
  post: Pick<Post, "slug" | "title">,
  category: Pick<Category, "name" | "slug"> | null | undefined,
  tags: Array<Pick<Tag, "name" | "slug">>
): Category {
  const key = getPostTaxonomyKey(post);
  const overrideSlug = POST_CATEGORY_OVERRIDES[key];
  if (overrideSlug) {
    return toCategoryRecord(EDITORIAL_CATEGORY_BY_SLUG.get(overrideSlug)!);
  }

  const canonicalTagSlugs = tags.map((tag) => canonicalizeTagSlug(tag.name || tag.slug));
  const titleAndSlug = `${post.title} ${post.slug}`.toLowerCase();

  let categorySlug: EditorialCategorySlug | undefined;
  if (canonicalTagSlugs.some((tag) => AI_TAGS.has(tag)) || /\b(ai|llm|text-to-sql)\b/.test(titleAndSlug)) {
    categorySlug = "ai-engineering";
  } else if (canonicalTagSlugs.some((tag) => STRATEGY_TAGS.has(tag))) {
    categorySlug = "technology-strategy";
  } else if (canonicalTagSlugs.some((tag) => LEADERSHIP_TAGS.has(tag))) {
    categorySlug = "engineering-leadership";
  } else if (canonicalTagSlugs.some((tag) => CAREER_TAGS.has(tag))) {
    categorySlug = "career-reflections";
  } else if (category) {
    const canonical = canonicalizeCategorySlug(category.slug || category.name);
    categorySlug = isEditorialCategorySlug(canonical) ? canonical : undefined;
  }

  const resolved = EDITORIAL_CATEGORY_BY_SLUG.get(categorySlug ?? "software-solution-architecture");
  return toCategoryRecord(resolved!);
}

export const FEATURED_INSIGHT_POST_KEYS = [
  "what-breaks-first-when-text-to-sql-moves-from-demo-to-production",
  "text-to-sql-from-demo-to-production",
  "software-solution-system-architecture",
  "from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform",
  "building-scaling-b2b-mobility-platform",
  "a-letter-to-my-past-self",
  "api-security",
] as const;

export function getFeaturedInsightRank(post: Pick<Post, "slug" | "title">): number {
  const key = getPostTaxonomyKey(post);
  const index = FEATURED_INSIGHT_POST_KEYS.indexOf(
    key as (typeof FEATURED_INSIGHT_POST_KEYS)[number]
  );
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export const PRIORITY_POST_ALIASES: Record<string, string> = {
  "text-to-sql-from-demo-to-production":
    "2026-07-24-what-breaks-first-when-text-to-sql-moves-from-demo-to-production",
  "what-breaks-first-when-text-to-sql-moves-from-demo-to-production":
    "2026-07-24-what-breaks-first-when-text-to-sql-moves-from-demo-to-production",
  "software-solution-system-architecture": "2023-06-16-software-solution-system-architecture",
  "a-letter-to-my-past-self": "2024-10-08-a-letter-to-my-past-self",
  "building-scaling-b2b-mobility-platform":
    "2026-07-25-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform",
  "building-and-scaling-a-b2b-mobility-platform":
    "2026-07-25-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform",
  "from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform":
    "2026-07-25-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform",
};

export function getCanonicalPostAliasTarget(slug: string): string | null {
  const normalizedSlug = normalizeSlug(slug);
  const key = stripDatePrefix(normalizedSlug);
  const target = PRIORITY_POST_ALIASES[key];

  return target && target !== normalizedSlug ? target : null;
}

export const POST_IMAGE_ALT_OVERRIDES: Record<string, string> = {
  "what-breaks-first-when-text-to-sql-moves-from-demo-to-production":
    "An enterprise operator using a conversational Text-to-SQL system protected by semantic, authorization, validation, and data-governance layers.",
  "text-to-sql-from-demo-to-production":
    "An enterprise operator using a conversational Text-to-SQL system protected by semantic, authorization, validation, and data-governance layers.",
  "building-scaling-b2b-mobility-platform":
    "A B2B mobility platform combining corporate ride management, cloud architecture, payments, operations, and business growth.",
  "building-and-scaling-a-b2b-mobility-platform":
    "A B2B mobility platform combining corporate ride management, cloud architecture, payments, operations, and business growth.",
  "from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform":
    "A B2B mobility platform combining corporate ride management, cloud architecture, payments, operations, and business growth.",
};

export function getPostImageAltText(
  post: Pick<Post, "slug" | "title">,
  assetAltText: string | null | undefined
): string {
  const trimmed = assetAltText?.trim();
  if (trimmed) {
    return trimmed;
  }

  return POST_IMAGE_ALT_OVERRIDES[getPostTaxonomyKey(post)] ?? post.title;
}
