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
      <div className="mx-auto flex w-full max-w-[1000px] gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
