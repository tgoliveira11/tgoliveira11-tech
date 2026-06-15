"use client";

import { defaultSignOutAccount } from "@tgoliveira/secure-auth/react/client";
import type { SecureAuthPageProps } from "@tgoliveira/secure-auth/react";
import { secureAuthAdminPaths } from "@/modules/admin/secure-auth-admin-paths";

/** Shared props for package settings pages embedded in the admin shell. */
export const secureAuthAdminPageProps: Pick<
  SecureAuthPageProps,
  "width" | "paths" | "onSignOut" | "appSlug" | "title" | "description"
> = {
  width: "wide",
  paths: secureAuthAdminPaths,
  onSignOut: defaultSignOutAccount,
  appSlug: "postforge",
  title: "",
  description: "",
};
