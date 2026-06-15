import { AdminLayout } from "@/components/admin/admin-layout";
import { requireAdminSession } from "@/modules/admin/authorization";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <AdminLayout adminEmail={session.user.email ?? "Admin"}>{children}</AdminLayout>
  );
}
