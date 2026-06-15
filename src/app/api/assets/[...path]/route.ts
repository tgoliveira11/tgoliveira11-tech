import { NextResponse } from "next/server";
import { assertSafeStorageKey } from "@/modules/assets/assets.validation";
import * as assetsService from "@/modules/assets/assets.service";
import { LocalStorageProvider } from "@/modules/assets/local-storage-provider";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { path } = await context.params;
    const storageKey = path.join("/");
    assertSafeStorageKey(storageKey);

    const provider = assetsService.getStorageProvider();
    if (!(provider instanceof LocalStorageProvider)) {
      return new NextResponse("Storage provider unavailable", { status: 404 });
    }

    const buffer = await provider.read(storageKey);
    const mimeType = assetsService.guessMimeTypeFromStorageKey(storageKey);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
