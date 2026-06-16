ALTER TABLE "analytics_events" ADD COLUMN "referrer_host" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "browser_name" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "os_name" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "accept_language" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "utm_source" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "utm_medium" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "utm_campaign" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "ip_hash" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "request_metadata" jsonb;