"use client";

import { Suspense, useCallback, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useReportWebVitals } from "next/web-vitals";

type GtagArguments =
  | ["js", Date]
  | ["config", string, Record<string, unknown>?]
  | ["event", string, Record<string, unknown>?];

type WebVitalsMetric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];
type SearchParamsLike = Pick<URLSearchParams, "get">;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArguments) => void;
    __googleAnalyticsInitialized?: Record<string, boolean>;
    __googleAnalyticsPreviousLocation?: string;
    tgoTrackPublicEvent?: (
      eventName: string,
      parameters?: Record<string, unknown>
    ) => void;
  }
}

type GoogleAnalyticsProps = {
  measurementId: string;
  enabled?: boolean;
};

function getInitScript(measurementId: string): string {
  const encodedMeasurementId = JSON.stringify(measurementId);

  return `
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
    window.__googleAnalyticsInitialized = window.__googleAnalyticsInitialized || {};
    if (!window.__googleAnalyticsInitialized[${encodedMeasurementId}]) {
      window.gtag("js", new Date());
      window.gtag("config", ${encodedMeasurementId}, {
        send_page_view: false,
        transport_type: "beacon"
      });
      window.__googleAnalyticsInitialized[${encodedMeasurementId}] = true;
    }
  `;
}

function ensureGoogleAnalytics(measurementId: string): void {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    ((...args: GtagArguments) => {
      window.dataLayer?.push(args);
    });
  window.__googleAnalyticsInitialized = window.__googleAnalyticsInitialized || {};

  if (window.__googleAnalyticsInitialized[measurementId]) {
    return;
  }

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false,
    transport_type: "beacon",
  });
  window.__googleAnalyticsInitialized[measurementId] = true;
}

function getUtmParameters(searchParams: SearchParamsLike): Record<string, string> {
  const entries = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ] as const;
  const output: Record<string, string> = {};

  for (const key of entries) {
    const value = searchParams.get(key)?.trim();
    if (value) {
      output[key] = value;
    }
  }

  return output;
}

function trackPublicEvent(
  measurementId: string,
  eventName: string,
  parameters: Record<string, unknown> = {}
): void {
  ensureGoogleAnalytics(measurementId);

  window.gtag?.("event", eventName, {
    send_to: measurementId,
    transport_type: "beacon",
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}`,
    page_title: document.title,
    ...getUtmParameters(new URLSearchParams(window.location.search)),
    ...parameters,
  });
}

function shouldTrackEntryArticle(pathname: string, pageReferrer?: string): boolean {
  if (!/^\/blog\/[^/]+/.test(pathname)) {
    return false;
  }

  try {
    if (window.sessionStorage.getItem("tgo_entry_article_tracked")) {
      return false;
    }

    const referrerUrl = pageReferrer ? new URL(pageReferrer) : null;
    const isInternalReferrer = referrerUrl?.origin === window.location.origin;
    window.sessionStorage.setItem("tgo_entry_article_tracked", "true");

    return !isInternalReferrer;
  } catch {
    return !pageReferrer;
  }
}

function GoogleAnalyticsRouteEvents({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    ensureGoogleAnalytics(measurementId);

    const queryString = searchParams.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;
    const pageLocation = `${window.location.origin}${pagePath}`;
    const pageReferrer = window.__googleAnalyticsPreviousLocation || document.referrer || undefined;
    const utmParameters = getUtmParameters(searchParams);

    window.gtag?.("event", "page_view", {
      page_location: pageLocation,
      page_path: pagePath,
      page_referrer: pageReferrer,
      page_title: document.title,
      send_to: measurementId,
      ...utmParameters,
    });
    window.__googleAnalyticsPreviousLocation = pageLocation;

    const searchTerm = searchParams.get("q")?.trim();
    if (pathname === "/search" && searchTerm) {
      window.gtag?.("event", "view_search_results", {
        page_location: pageLocation,
        search_term: searchTerm,
        send_to: measurementId,
        ...utmParameters,
      });
    }

    if (pathname === "/about") {
      trackPublicEvent(measurementId, "about_page_visit", {
        page_location: pageLocation,
        ...utmParameters,
      });
    }

    if (shouldTrackEntryArticle(pathname, pageReferrer)) {
      trackPublicEvent(measurementId, "entry_article", {
        article_path: pathname,
        page_location: pageLocation,
        page_referrer: pageReferrer,
        ...utmParameters,
      });
    }
  }, [measurementId, pathname, searchParams]);

  return null;
}

function GoogleAnalyticsConversionEvents({ measurementId }: { measurementId: string }) {
  useEffect(() => {
    window.tgoTrackPublicEvent = (eventName, parameters) => {
      trackPublicEvent(measurementId, eventName, parameters);
    };

    function handleTrackedClick(event: MouseEvent) {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-analytics-event]")
          : null;
      const eventName = target?.dataset.analyticsEvent?.trim();
      if (!target || !eventName) {
        return;
      }

      const href =
        target instanceof HTMLAnchorElement
          ? target.href
          : target.getAttribute("href") ?? undefined;

      trackPublicEvent(measurementId, eventName, {
        event_label: target.dataset.analyticsLabel || target.textContent?.trim(),
        link_url: href,
        link_text: target.textContent?.trim(),
        component: target.dataset.analyticsComponent,
        article_slug: target.dataset.analyticsArticleSlug,
        source: target.dataset.analyticsSource,
        file: target.dataset.analyticsFile,
      });
    }

    document.addEventListener("click", handleTrackedClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleTrackedClick, { capture: true });
      if (window.tgoTrackPublicEvent) {
        delete window.tgoTrackPublicEvent;
      }
    };
  }, [measurementId]);

  return null;
}

function GoogleAnalyticsWebVitals({ measurementId }: { measurementId: string }) {
  const reportWebVitals = useCallback(
    (metric: WebVitalsMetric) => {
      ensureGoogleAnalytics(measurementId);

      window.gtag?.("event", metric.name, {
        event_category: "Web Vitals",
        event_label: metric.id,
        metric_delta: metric.delta,
        metric_id: metric.id,
        metric_name: metric.name,
        metric_navigation_type: metric.navigationType,
        metric_rating: metric.rating,
        metric_value: metric.value,
        non_interaction: true,
        send_to: measurementId,
        value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      });
    },
    [measurementId]
  );

  useReportWebVitals(reportWebVitals);
  return null;
}

export function GoogleAnalytics({
  measurementId,
  enabled = true,
}: GoogleAnalyticsProps) {
  if (!enabled) {
    return null;
  }

  return (
    <>
      <Script
        id="google-analytics-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: getInitScript(measurementId) }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsRouteEvents measurementId={measurementId} />
      </Suspense>
      <GoogleAnalyticsConversionEvents measurementId={measurementId} />
      <GoogleAnalyticsWebVitals measurementId={measurementId} />
    </>
  );
}
