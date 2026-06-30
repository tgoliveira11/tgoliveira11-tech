import { beforeEach, describe, expect, it, vi } from "vitest";

function drizzleResult<T>(value: T) {
  const promise = Promise.resolve(value);
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") {
          return promise.then.bind(promise);
        }
        return () => drizzleResult(value);
      },
    }
  );
}

const { selectMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
}));

vi.mock("@/db/get-db", () => ({
  db: {
    select: selectMock,
  },
}));

import {
  countPostsWithViews,
  getBlogViewsByDay,
  getDailyStatsForPost,
  getPostViewsByDay,
  getRecentAnalyticsEvents,
  getTopBrowsers,
  getTopCountries,
  getTopDeviceTypes,
  getTopOperatingSystems,
  getTopPostsByViews,
  getTopReferrerHosts,
  getTopUtmCampaigns,
  getTopUtmSources,
  hasSessionViewToday,
  sumAllBlogViews,
  sumAllViews,
  sumBlogViewsSince,
  sumViewsSince,
} from "./analytics.repository";

describe("analytics repository stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects existing session views for today", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        where: () => ({
          limit: () => drizzleResult([{ id: "event-1" }]),
        }),
      }),
    }));
    await expect(hasSessionViewToday("post-1", "session")).resolves.toBe(true);

    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        where: () => ({
          limit: () => drizzleResult([]),
        }),
      }),
    }));
    await expect(hasSessionViewToday("post-1", "session")).resolves.toBe(false);
  });

  it("aggregates daily and total views", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        where: () => ({
          orderBy: () => drizzleResult([{ date: "2026-06-01", views: 3 }]),
        }),
      }),
    }));
    await expect(getDailyStatsForPost("post-1")).resolves.toEqual([
      { date: "2026-06-01", views: 3 },
    ]);

    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        where: () => drizzleResult([{ total: 12 }]),
      }),
    }));
    await expect(sumViewsSince("post-1", "2026-06-01")).resolves.toBe(12);

    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        where: () => drizzleResult([{ total: 20 }]),
      }),
    }));
    await expect(sumAllViews("post-1")).resolves.toBe(20);
  });

  it("aggregates blog-wide views", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        where: () => drizzleResult([{ total: 30 }]),
      }),
    }));
    await expect(sumBlogViewsSince("2026-06-01")).resolves.toBe(30);

    selectMock.mockImplementationOnce(() => ({
      from: () => drizzleResult([{ total: 40 }]),
    }));
    await expect(sumAllBlogViews()).resolves.toBe(40);

    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        where: () => drizzleResult([{ count: 7 }]),
      }),
    }));
    await expect(countPostsWithViews()).resolves.toBe(7);
  });

  it("returns views grouped by day", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        where: () => ({
          groupBy: () => ({
            orderBy: () => drizzleResult([{ date: "2026-06-01", views: 5 }]),
          }),
        }),
      }),
    }));
    await expect(getBlogViewsByDay("2026-06-01")).resolves.toEqual([
      { date: "2026-06-01", views: 5 },
    ]);

    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        where: () => ({
          orderBy: () => drizzleResult([{ date: "2026-06-02", views: 2 }]),
        }),
      }),
    }));
    await expect(getPostViewsByDay("post-1", "2026-06-01")).resolves.toEqual([
      { date: "2026-06-02", views: 2 },
    ]);
  });

  it("returns top posts and grouped analytics fields", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        leftJoin: () => ({
          groupBy: () => ({
            orderBy: () => ({
              limit: () =>
                drizzleResult([
                  {
                    postId: "post-1",
                    title: "Hello",
                    slug: "hello",
                    status: "published",
                    totalViews: 10,
                    viewsLast7Days: 4,
                  },
                ]),
            }),
          }),
        }),
      }),
    }));
    await expect(getTopPostsByViews(5)).resolves.toEqual([
      expect.objectContaining({ postId: "post-1", totalViews: 10 }),
    ]);

    selectMock.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          groupBy: () => ({
            orderBy: () => ({
              limit: () => drizzleResult([{ label: "US", count: 3 }]),
            }),
          }),
        }),
      }),
    }));

    await expect(getTopCountries({ postId: "post-1" })).resolves.toEqual([
      { label: "US", count: 3 },
    ]);
    await expect(getTopReferrerHosts({ postId: "post-1" })).resolves.toEqual([
      { label: "US", count: 3 },
    ]);
    await expect(getTopBrowsers({ postId: "post-1" })).resolves.toEqual([
      { label: "US", count: 3 },
    ]);
    await expect(getTopDeviceTypes({ postId: "post-1" })).resolves.toEqual([
      { label: "US", count: 3 },
    ]);
    await expect(getTopOperatingSystems({ postId: "post-1" })).resolves.toEqual([
      { label: "US", count: 3 },
    ]);
    await expect(getTopUtmSources({ postId: "post-1" })).resolves.toEqual([
      { label: "US", count: 3 },
    ]);
    await expect(getTopUtmCampaigns({ postId: "post-1" })).resolves.toEqual([
      { label: "US", count: 3 },
    ]);
  });

  it("returns recent analytics events with post join", async () => {
    selectMock.mockImplementationOnce(() => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            orderBy: () => ({
              limit: () =>
                drizzleResult([
                  {
                    occurredAt: new Date("2026-06-01"),
                    postTitle: "Hello",
                    path: "/blog/hello",
                  },
                ]),
            }),
          }),
        }),
      }),
    }));

    const events = await getRecentAnalyticsEvents({ postId: "post-1", limit: 5 });
    expect(events[0]).toMatchObject({ postTitle: "Hello", path: "/blog/hello" });
  });
});
