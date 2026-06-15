import { ConflictError, NotFoundError } from "@/lib/errors";
import * as repo from "./redirects.repository";
import type { Redirect } from "./redirects.types";
import { createRedirectSchema, type CreateRedirectInput } from "./redirects.validation";

export async function createRedirect(input: CreateRedirectInput): Promise<Redirect> {
  const parsed = createRedirectSchema.parse(input);

  if (await repo.findRedirectBySourcePath(parsed.sourcePath)) {
    throw new ConflictError("Redirect already exists for source path");
  }

  return repo.insertRedirect({
    sourcePath: parsed.sourcePath,
    targetPath: parsed.targetPath,
    statusCode: parsed.statusCode,
  });
}

export async function getRedirectBySourcePath(sourcePath: string): Promise<Redirect> {
  const redirect = await repo.findRedirectBySourcePath(sourcePath);
  if (!redirect) {
    throw new NotFoundError("Redirect not found");
  }
  return redirect;
}

export async function listRedirects(): Promise<Redirect[]> {
  return repo.listRedirects();
}

export async function deleteRedirect(id: string): Promise<void> {
  const deleted = await repo.deleteRedirectById(id);
  if (!deleted) {
    throw new NotFoundError("Redirect not found");
  }
}
