import type { ReactNode } from "react";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";

export function AdminLayout({
  adminEmail,
  children,
}: {
  adminEmail: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminHeader adminEmail={adminEmail} />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
