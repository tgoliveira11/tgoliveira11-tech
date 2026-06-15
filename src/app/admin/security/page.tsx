import { SecureAuthAdminPage } from "@/components/admin/secure-auth-admin-page";
import { AdminSecuritySettingsPanel } from "@/components/admin/secure-auth-admin-settings";

export default function AdminSecurityPage() {
  return (
    <SecureAuthAdminPage
      title="Security"
      description="Manage password, two-factor authentication, passkeys, and account protection."
    >
      <AdminSecuritySettingsPanel />
    </SecureAuthAdminPage>
  );
}
