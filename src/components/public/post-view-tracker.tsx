"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    tgoTrackPublicEvent?: (
      eventName: string,
      parameters?: Record<string, unknown>
    ) => void;
  }
}

export function PostViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    void fetch("/api/analytics/post-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {
      // Tracking failures must not affect reading experience.
    });
  }, [slug]);

  useEffect(() => {
    const trackedDepths = new Set<number>();
    let completionTracked = false;
    let ticking = false;

    function trackArticleDepth() {
      ticking = false;

      const documentElement = document.documentElement;
      const scrollableHeight = Math.max(
        documentElement.scrollHeight - window.innerHeight,
        1
      );
      const scrollDepth = Math.min(
        100,
        Math.round(((window.scrollY + window.innerHeight) / documentElement.scrollHeight) * 100)
      );

      for (const threshold of [25, 50, 75]) {
        if (scrollDepth >= threshold && !trackedDepths.has(threshold)) {
          trackedDepths.add(threshold);
          window.tgoTrackPublicEvent?.("article_scroll_depth", {
            article_slug: slug,
            scroll_depth: threshold,
          });
        }
      }

      const bottomReached = window.scrollY >= scrollableHeight * 0.9;
      if ((scrollDepth >= 90 || bottomReached) && !completionTracked) {
        completionTracked = true;
        window.tgoTrackPublicEvent?.("article_completion", {
          article_slug: slug,
          scroll_depth: scrollDepth,
        });
      }
    }

    function scheduleDepthCheck() {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(trackArticleDepth);
    }

    scheduleDepthCheck();
    window.addEventListener("scroll", scheduleDepthCheck, { passive: true });
    window.addEventListener("resize", scheduleDepthCheck);

    return () => {
      window.removeEventListener("scroll", scheduleDepthCheck);
      window.removeEventListener("resize", scheduleDepthCheck);
    };
  }, [slug]);

  return null;
}
