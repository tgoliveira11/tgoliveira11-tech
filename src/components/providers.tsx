"use client";

import { SessionProvider } from "next-auth/react";
import {
  SecureAuthUIProvider,
  type SecureAuthUIPublicConfig,
} from "@tgoliveira/secure-auth/react";
import { ThemeProvider } from "@/components/theme/theme-provider";

export function Providers({
  children,
  uiConfig,
}: {
  children: React.ReactNode;
  uiConfig: SecureAuthUIPublicConfig;
}) {
  const refetchInterval = uiConfig.sessionPolicy.revocationPollIntervalSeconds;

  return (
    <SessionProvider refetchInterval={refetchInterval > 0 ? refetchInterval : undefined}>
      <ThemeProvider>
        <SecureAuthUIProvider config={uiConfig}>{children}</SecureAuthUIProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
