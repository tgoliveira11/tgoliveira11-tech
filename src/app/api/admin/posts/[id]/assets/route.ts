import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import { requireAdminApiSession } from "@/modules/admin/authorization";
import * as assetsService from "@/modules/assets/assets.service";
import * as postsService from "@/modules/posts/posts.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function mapError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: error.statusCode });
  }
  if (error instanceof Error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireAdminApiSession();
    const { id: postId } = await context.params;
    await postsService.getById(postId);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const altText = formData.get("altText");
    const caption = formData.get("caption");

    const asset = await assetsService.uploadPostAsset({
      postId,
      buffer,
      originalFilename: file.name,
      mimeType: file.type || "application/octet-stream",
      altText: typeof altText === "string" ? altText : null,
      caption: typeof caption === "string" ? caption : null,
      userId: session.user.id,
    });

    return NextResponse.json({ ok: true, asset });
  } catch (error) {
    return mapError(error);
  }
}
