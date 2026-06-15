import { SecureAuthAdminPage } from "@/components/admin/secure-auth-admin-page";
import { AdminSessionsSettingsPanel } from "@/components/admin/secure-auth-admin-settings";

export default function AdminSessionsPage() {
  return (
    <SecureAuthAdminPage
      title="Sessions"
      description="Review and revoke active sessions."
    >
      <AdminSessionsSettingsPanel />
    </SecureAuthAdminPage>
  );
}
