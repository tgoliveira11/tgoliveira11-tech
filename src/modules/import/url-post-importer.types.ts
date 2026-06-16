export type ParsedUrlPost = {
  finalUrl: string;
  sourceHost: string;
  sourcePath: string;
  canonicalUrl: string | null;
  title: string;
  excerpt: string;
  slug: string;
  contentHtml: string;
  contentMarkdown: string;
  mainImageUrl: string | null;
  warnings: string[];
};

export type UrlPostImportReport = {
  finalUrl: string;
  sourcePath: string;
  requestedSlug: string;
  postId: string;
  postSlug: string;
  title: string;
  excerpt: string;
  mainImageImported: boolean;
  mainImageUrl: string | null;
  redirectCreated: boolean;
  warnings: string[];
};

export type UrlPostImportResult = {
  postId: string;
  report: UrlPostImportReport;
};
