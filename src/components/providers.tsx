"use client";

import { SessionProvider } from "next-auth/react";
import {
  SecureAuthUIProvider,
  type SecureAuthUIPublicConfig,
} from "@tgoliveira/secure-auth/react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import type { ForcedPublicTheme } from "@/lib/env";

export function Providers({
  children,
  uiConfig,
  forcedPublicTheme = null,
}: {
  children: React.ReactNode;
  uiConfig: SecureAuthUIPublicConfig;
  forcedPublicTheme?: ForcedPublicTheme | null;
}) {
  const refetchInterval = uiConfig.sessionPolicy.revocationPollIntervalSeconds;

  return (
    <SessionProvider refetchInterval={refetchInterval > 0 ? refetchInterval : undefined}>
      <ThemeProvider forcedPublicTheme={forcedPublicTheme}>
        <SecureAuthUIProvider config={uiConfig}>{children}</SecureAuthUIProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
