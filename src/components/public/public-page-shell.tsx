import type { ReactNode } from "react";

export function PublicPageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`space-y-10 ${className}`.trim()}>{children}</div>;
}
