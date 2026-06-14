import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { secureAuth } from "@/lib/auth/secure-auth";

export const metadata: Metadata = {
  title: "PostForge",
  description: "Markdown-based blog publishing platform",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers uiConfig={secureAuth.uiConfig}>{children}</Providers>
      </body>
    </html>
  );
}
