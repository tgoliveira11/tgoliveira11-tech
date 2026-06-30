import { handleOutpostAdminRoute } from "@/lib/outpost/handle-outpost-admin-route";

export async function GET(request: Request) {
  return handleOutpostAdminRoute((admin) => admin.routes.adminConfig.GET, request);
}

export async function POST(request: Request) {
  return handleOutpostAdminRoute((admin) => admin.routes.adminConfig.POST, request);
}

export async function DELETE(request: Request) {
  return handleOutpostAdminRoute((admin) => admin.routes.adminConfig.DELETE, request);
}
