import type { ReactNode } from "react";
import { AdminPageTitle } from "./admin-page-title";
import { SecureAuthAdminSurface } from "./secure-auth-admin-surface";

export function SecureAuthAdminPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <>
      <AdminPageTitle title={title} description={description} />
      <SecureAuthAdminSurface>{children}</SecureAuthAdminSurface>
    </>
  );
}
