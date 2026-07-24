import { notFound, permanentRedirect } from "next/navigation";
import { getLegacyPostRedirectPath } from "@/lib/legacy-post-redirect";
import { normalizeUrlPath } from "@/lib/paths";
import * as redirectsRepo from "@/modules/redirects/redirects.repository";

type PageProps = {
  params: Promise<{ legacyPath: string[] }>;
};

export default async function LegacyRedirectPage({ params }: PageProps) {
  const { legacyPath } = await params;
  const sourcePath = normalizeUrlPath(`/${legacyPath.join("/")}`);
  const staticRedirect = getLegacyPostRedirectPath(sourcePath);
  if (staticRedirect) {
    permanentRedirect(staticRedirect);
  }

  const redirect = await redirectsRepo.findRedirectBySourcePath(sourcePath);

  if (!redirect) {
    notFound();
  }

  permanentRedirect(redirect.targetPath);
}
