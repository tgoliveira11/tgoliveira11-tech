import type { ReactNode } from "react";

export function SecureAuthAdminSurface({ children }: { children: ReactNode }) {
  return <div className="secure-auth-admin-surface">{children}</div>;
}
