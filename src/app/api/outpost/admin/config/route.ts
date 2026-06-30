import { getOutpostAdmin } from "@/lib/outpost/outpost-admin";

export async function GET(request: Request) {
  return getOutpostAdmin().routes.adminConfig.GET(request);
}

export async function POST(request: Request) {
  return getOutpostAdmin().routes.adminConfig.POST(request);
}

export async function DELETE(request: Request) {
  return getOutpostAdmin().routes.adminConfig.DELETE(request);
}
