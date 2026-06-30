import { getOutpostAdmin } from "@/lib/outpost/outpost-admin";

export async function POST(request: Request) {
  return getOutpostAdmin().routes.adminWorkerSend.POST(request);
}
