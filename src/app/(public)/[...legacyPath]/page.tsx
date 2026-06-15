import { notFound, permanentRedirect } from "next/navigation";
import { normalizeUrlPath } from "@/lib/paths";
import * as redirectsRepo from "@/modules/redirects/redirects.repository";

type PageProps = {
  params: Promise<{ legacyPath: string[] }>;
};

export default async function LegacyRedirectPage({ params }: PageProps) {
  const { legacyPath } = await params;
  const sourcePath = normalizeUrlPath(`/${legacyPath.join("/")}`);
  const redirect = await redirectsRepo.findRedirectBySourcePath(sourcePath);

  if (!redirect) {
    notFound();
  }

  permanentRedirect(redirect.targetPath);
}
