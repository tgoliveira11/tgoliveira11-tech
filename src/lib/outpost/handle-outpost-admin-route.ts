import "server-only";

import { getOutpostAdmin } from "@/lib/outpost/outpost-admin";

type OutpostAdmin = ReturnType<typeof getOutpostAdmin>;
type OutpostAdminRouteHandler = (request: Request) => Response | Promise<Response>;

/** Catches Outpost composition-root failures (missing env) before the package handler runs. */
export async function handleOutpostAdminRoute(
  selectHandler: (admin: OutpostAdmin) => OutpostAdminRouteHandler,
  request: Request
): Promise<Response> {
  try {
    return await selectHandler(getOutpostAdmin())(request);
  } catch (error) {
    console.error("[outpost-admin]", error);
    const message =
      error instanceof Error ? error.message : "Outpost admin failed to initialize";
    return Response.json({ error: "outpost_admin_unavailable", message }, { status: 503 });
  }
}
