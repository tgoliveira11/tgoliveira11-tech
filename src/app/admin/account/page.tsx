import { SecureAuthAdminPage } from "@/components/admin/secure-auth-admin-page";
import { AdminAccountSettingsPanel } from "@/components/admin/secure-auth-admin-settings";

export default function AdminAccountPage() {
  return (
    <SecureAuthAdminPage
      title="Account"
      description="Manage your profile, account details, and authentication preferences."
    >
      <AdminAccountSettingsPanel />
    </SecureAuthAdminPage>
  );
}
