import { handleOutpostAdminRoute } from "@/lib/outpost/handle-outpost-admin-route";

export async function GET(request: Request) {
  return handleOutpostAdminRoute((admin) => admin.routes.adminQueue.GET, request);
}
