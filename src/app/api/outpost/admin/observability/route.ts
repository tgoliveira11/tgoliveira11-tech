import { getOutpostAdmin } from "@/lib/outpost/outpost-admin";

export async function GET(request: Request) {
  return getOutpostAdmin().routes.adminObservability.GET(request);
}
