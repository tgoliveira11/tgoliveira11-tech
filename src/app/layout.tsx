import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ThemeScript } from "@/components/theme/theme-script";
import { secureAuth } from "@/lib/auth/secure-auth";
import { readPublicSiteTheme } from "@/lib/env";

export const metadata: Metadata = {
  title: "PostForge",
  description: "Markdown-based blog publishing platform",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const forcedPublicTheme = readPublicSiteTheme();

  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeScript forcedPublicTheme={forcedPublicTheme} />
        <Providers uiConfig={secureAuth.uiConfig} forcedPublicTheme={forcedPublicTheme}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
