import "server-only";

import { createOutpost } from "@tgoliveira/outpost";
import {
  DrizzleApiKeyRepository,
  DrizzleAuditRepository,
  DrizzleConfigOverrideRepository,
  DrizzleOutboxRepository,
  DrizzleSuppressionRepository,
  DrizzleWebhookEventRepository,
  type OutpostDb,
} from "@tgoliveira/outpost/drizzle";
import { db } from "@/db/client";
import { buildOutpostClientOptions } from "@/lib/outpost/outpost-from-env";

let outpostInstance: ReturnType<typeof createOutpost> | null = null;
let configOverrideRepository: DrizzleConfigOverrideRepository | null = null;

function getOutpostDb(): OutpostDb {
  return db as unknown as OutpostDb;
}

export function getOutpost() {
  if (!outpostInstance) {
    const outpostDb = getOutpostDb();
    outpostInstance = createOutpost({
      repositories: {
        outbox: new DrizzleOutboxRepository(outpostDb),
        suppressions: new DrizzleSuppressionRepository(outpostDb),
        audit: new DrizzleAuditRepository(outpostDb),
        apiKeys: new DrizzleApiKeyRepository(outpostDb),
        webhookEvents: new DrizzleWebhookEventRepository(outpostDb),
      },
      ...buildOutpostClientOptions(),
    });
  }

  return outpostInstance;
}

export function getOutpostConfigOverrideRepository() {
  if (!configOverrideRepository) {
    configOverrideRepository = new DrizzleConfigOverrideRepository(getOutpostDb());
  }

  return configOverrideRepository;
}
