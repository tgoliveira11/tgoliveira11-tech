import { redirect } from "next/navigation";
import { SECURE_AUTH_ADMIN_PATHS } from "@/modules/admin/secure-auth-admin-paths";

export default function SettingsSessionsRedirectPage() {
  redirect(SECURE_AUTH_ADMIN_PATHS.sessions);
}
