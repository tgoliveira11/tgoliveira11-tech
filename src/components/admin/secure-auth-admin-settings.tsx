"use client";

import {
  AccountSettingsPage,
  SecuritySettingsPage,
  SessionsSettingsPage,
} from "@tgoliveira/secure-auth/react";
import { secureAuthAdminPageProps } from "./secure-auth-admin-page-props";

export function AdminAccountSettingsPanel() {
  return <AccountSettingsPage {...secureAuthAdminPageProps} />;
}

export function AdminSecuritySettingsPanel() {
  return <SecuritySettingsPage {...secureAuthAdminPageProps} />;
}

export function AdminSessionsSettingsPanel() {
  return <SessionsSettingsPage {...secureAuthAdminPageProps} />;
}
