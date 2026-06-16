/** Repo-local transactional email brand for tgoliveira11-tech. */
export const EMAIL_BRAND = {
  siteName: "tgoliveira11 tech",
  tagline: "Software architecture · Engineering leadership · AI",
  githubUrl: "https://github.com/tgoliveira11",
  linkedInUrl: "https://www.linkedin.com/in/tgoliveira/",
  colors: {
    pageBackground: "#f3f5f8",
    cardBackground: "#ffffff",
    heading: "#111827",
    body: "#374151",
    muted: "#6b7280",
    accent: "#1e3a5f",
    buttonBackground: "#1e3a5f",
    buttonText: "#ffffff",
    border: "#e5e7eb",
    footer: "#6b7280",
  },
  securityNote:
    "If you did not request this, you can safely ignore this email or review your account security.",
  transactionalFooter:
    "This email was sent because an action was requested on your account.",
} as const;
