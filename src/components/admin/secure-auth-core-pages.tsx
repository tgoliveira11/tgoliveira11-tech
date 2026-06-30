"use client";

import {
  AdminApiKeysPage,
  AdminConfigPage,
  AdminInvitesPage,
  AdminLocksPage,
  AdminPanelPage,
  AdminUsersPage,
  AdminWaitlistPage,
} from "@tgoliveira/secure-auth/react";
import {
  SECURE_AUTH_ADMIN_API_BASE,
  secureAuthCorePaths,
} from "@/modules/admin/secure-auth-core-paths";

const sharedProps = {
  paths: secureAuthCorePaths,
  apiBase: SECURE_AUTH_ADMIN_API_BASE,
} as const;

export function SecureAuthAdminPanelPage() {
  return (
    <div className="admin-secure-auth-core">
      <AdminPanelPage paths={secureAuthCorePaths} />
    </div>
  );
}

export function SecureAuthAdminUsersPage() {
  return (
    <div className="admin-secure-auth-core">
      <AdminUsersPage {...sharedProps} />
    </div>
  );
}

export function SecureAuthAdminLocksPage() {
  return (
    <div className="admin-secure-auth-core">
      <AdminLocksPage {...sharedProps} />
    </div>
  );
}

export function SecureAuthAdminWaitlistPage() {
  return (
    <div className="admin-secure-auth-core">
      <AdminWaitlistPage {...sharedProps} />
    </div>
  );
}

export function SecureAuthAdminInvitesPage() {
  return (
    <div className="admin-secure-auth-core">
      <AdminInvitesPage {...sharedProps} />
    </div>
  );
}

export function SecureAuthAdminApiKeysPage() {
  return (
    <div className="admin-secure-auth-core">
      <AdminApiKeysPage {...sharedProps} />
    </div>
  );
}

export function SecureAuthAdminConfigPage() {
  return (
    <div className="admin-secure-auth-core">
      <AdminConfigPage {...sharedProps} />
    </div>
  );
}
