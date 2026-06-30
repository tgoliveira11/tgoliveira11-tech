export * from "@tgoliveira/secure-auth/drizzle/schema";
export * from "./blog-schema";

import { outpostSchema } from "@tgoliveira/outpost/drizzle";

/** Outpost tables (prefixed exports avoid clashing with secure-auth `apiKeys` / `auditEvents`). */
export const outpostOutbox = outpostSchema.outbox;
export const outpostSuppressions = outpostSchema.suppressions;
export const outpostAuditEvents = outpostSchema.auditEvents;
export const outpostApiKeys = outpostSchema.apiKeys;
export const outpostWebhookEvents = outpostSchema.webhookEvents;
export const outpostAdminConfigOverrides = outpostSchema.adminConfigOverrides;

export { outpostSchema, lifecycleStateEnum, suppressionReasonEnum } from "@tgoliveira/outpost/drizzle";
