import type { ReactNode } from "react";

export function AdminDangerZone({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 className="text-sm font-semibold text-red-800">{title}</h2>
      {description ? <p className="mt-1 text-sm text-red-700">{description}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </section>
  );
}
