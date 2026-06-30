import "server-only";

import { createOutpostAdmin } from "@tgoliveira/outpost/admin";
import { getOutpost, getOutpostConfigOverrideRepository } from "@/lib/outpost/outpost";
import { requireOutpostAdmin } from "@/lib/outpost/require-outpost-admin";

let outpostAdminInstance: ReturnType<typeof createOutpostAdmin> | null = null;

export function getOutpostAdmin() {
  if (!outpostAdminInstance) {
    outpostAdminInstance = createOutpostAdmin({
      outpost: getOutpost(),
      requireAdmin: requireOutpostAdmin,
      configOverrideRepository: getOutpostConfigOverrideRepository(),
      env: process.env,
      admin: {
        enabled: true,
      },
    });
  }

  return outpostAdminInstance;
}
