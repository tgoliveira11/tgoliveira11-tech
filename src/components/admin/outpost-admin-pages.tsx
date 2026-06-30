"use client";

import {
  AdminConfigPage,
  AdminObservabilityPage,
  AdminPanelPage,
  AdminQueuePage,
} from "@tgoliveira/outpost/react";
import {
  OUTPOST_ADMIN_API_BASE,
  outpostAdminPaths,
} from "@/modules/admin/outpost-admin-paths";

const sharedProps = {
  apiBase: OUTPOST_ADMIN_API_BASE,
} as const;

export function OutpostAdminPanelPage() {
  return (
    <div className="admin-outpost-core">
      <AdminPanelPage paths={outpostAdminPaths} />
    </div>
  );
}

export function OutpostAdminQueuePage() {
  return (
    <div className="admin-outpost-core">
      <AdminQueuePage {...sharedProps} />
    </div>
  );
}

export function OutpostAdminConfigPage() {
  return (
    <div className="admin-outpost-core">
      <AdminConfigPage {...sharedProps} />
    </div>
  );
}

export function OutpostAdminObservabilityPage() {
  return (
    <div className="admin-outpost-core">
      <AdminObservabilityPage {...sharedProps} />
    </div>
  );
}
