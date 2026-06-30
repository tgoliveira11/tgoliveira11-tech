import { describe, expect, it, vi } from "vitest";

const adminRoutes = {
  adminQueue: { GET: vi.fn(() => new Response("queue")) },
  adminConfig: {
    GET: vi.fn(() => new Response("config-get")),
    POST: vi.fn(() => new Response("config-post")),
    DELETE: vi.fn(() => new Response("config-delete")),
  },
  adminObservability: { GET: vi.fn(() => new Response("obs")) },
  adminWorkerSend: { POST: vi.fn(() => new Response("worker")) },
};

vi.mock("@/lib/outpost/outpost-admin", () => ({
  getOutpostAdmin: vi.fn(() => ({ routes: adminRoutes })),
}));

describe("outpost admin API routes", () => {
  it("delegates queue GET", async () => {
    const { GET } = await import("@/app/api/outpost/admin/queue/route");
    const response = await GET(new Request("http://localhost"));
    expect(response.status).toBe(200);
    expect(adminRoutes.adminQueue.GET).toHaveBeenCalled();
  });

  it("delegates config methods", async () => {
    const route = await import("@/app/api/outpost/admin/config/route");
    await route.GET(new Request("http://localhost"));
    await route.POST(new Request("http://localhost"));
    await route.DELETE(new Request("http://localhost"));
    expect(adminRoutes.adminConfig.GET).toHaveBeenCalled();
    expect(adminRoutes.adminConfig.POST).toHaveBeenCalled();
    expect(adminRoutes.adminConfig.DELETE).toHaveBeenCalled();
  });

  it("delegates observability and worker routes", async () => {
    const observability = await import("@/app/api/outpost/admin/observability/route");
    const worker = await import("@/app/api/outpost/admin/worker/send/route");

    await observability.GET(new Request("http://localhost"));
    await worker.POST(new Request("http://localhost"));

    expect(adminRoutes.adminObservability.GET).toHaveBeenCalled();
    expect(adminRoutes.adminWorkerSend.POST).toHaveBeenCalled();
  });
});
