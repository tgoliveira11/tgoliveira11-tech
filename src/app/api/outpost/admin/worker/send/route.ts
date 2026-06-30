import { handleOutpostAdminRoute } from "@/lib/outpost/handle-outpost-admin-route";

export async function POST(request: Request) {
  return handleOutpostAdminRoute((admin) => admin.routes.adminWorkerSend.POST, request);
}
