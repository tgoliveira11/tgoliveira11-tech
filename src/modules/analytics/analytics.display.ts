import { readAnalyticsStoreRawIp } from "@/lib/env";
import type { RecentVisitRow } from "./analytics.types";

type RawRecentVisit = {
  occurredAt: Date;
  postTitle?: string | null;
  path?: string | null;
  referrerHost?: string | null;
  country?: string | null;
  city?: string | null;
  deviceType?: string | null;
  browserName?: string | null;
  osName?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  ipAddress?: string | null;
  ipHash?: string | null;
  requestMetadata?: {
    path?: string | null;
  } | null;
};

export function sanitizeRecentVisitForDisplay(
  row: RawRecentVisit,
  showRawIp = readAnalyticsStoreRawIp()
): RecentVisitRow {
  return {
    occurredAt: row.occurredAt,
    postTitle: row.postTitle ?? undefined,
    path: row.path ?? row.requestMetadata?.path ?? null,
    referrerHost: row.referrerHost ?? "Direct / none",
    country: row.country ?? null,
    city: row.city ?? null,
    deviceType: row.deviceType ?? "unknown",
    browserName: row.browserName ?? null,
    osName: row.osName ?? null,
    utmSource: row.utmSource ?? null,
    utmCampaign: row.utmCampaign ?? null,
    ipHash: row.ipHash ?? null,
    ipAddress: showRawIp ? row.ipAddress ?? null : null,
  };
}
