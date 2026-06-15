export type ImportMode = "dry-run" | "import";

export type GitHubPagesImportConfig = {
  sourceRoot: string;
  assetsRoot?: string;
  mode: ImportMode;
  defaultStatus: "draft" | "published";
  publishImported: boolean;
  preserveUrls: boolean;
  baseOldPath: string;
  baseNewPath: string;
  authorEmail?: string;
  reportDir: string;
};

export type LegacySourceStatus = "draft" | "published" | "unknown";

export type ParsedLegacyPost = {
  sourcePath: string;
  relativePath: string;
  title: string;
  desiredSlug: string;
  excerpt: string | null;
  contentMarkdown: string;
  publishedAt: Date | null;
  sourceStatus: LegacySourceStatus;
  tags: string[];
  categories: string[];
  coverImageRef: string | null;
  ogImageRef: string | null;
  oldPaths: string[];
  unsupportedFrontmatter: string[];
  warnings: string[];
  errors: string[];
};

export type MarkdownImageReference = {
  fullMatch: string;
  alt: string;
  url: string;
  isRemote: boolean;
};

export type ResolvedLocalImage = {
  reference: MarkdownImageReference;
  absolutePath: string;
};

export type ImportReportEntry = {
  sourceFile: string;
  status: "imported" | "skipped" | "error" | "planned";
  postId?: string;
  slug?: string;
  message?: string;
};

export type ImportReport = {
  mode: ImportMode;
  startedAt: string;
  finishedAt: string;
  totalFilesScanned: number;
  filesImported: number;
  filesSkipped: number;
  postsCreated: number;
  postsUpdated: number;
  slugConflicts: Array<{ file: string; slug: string; reason: string }>;
  redirectsCreated: Array<{ sourcePath: string; targetPath: string }>;
  redirectsSkipped: Array<{ sourcePath: string; reason: string }>;
  tagsCreated: string[];
  categoriesCreated: string[];
  imagesCopied: Array<{ source: string; publicUrl: string; file: string }>;
  imagesMissing: Array<{ reference: string; file: string }>;
  remoteImagesPreserved: Array<{ url: string; file: string }>;
  unsupportedFrontmatter: Array<{ file: string; fields: string[] }>;
  validationErrors: Array<{ file: string; error: string }>;
  warnings: string[];
  entries: ImportReportEntry[];
};

export type ImportWriter = {
  slugExists(slug: string): Promise<boolean>;
  findOrCreateTag(name: string): Promise<{ id: string; created: boolean }>;
  findOrCreateCategory(name: string): Promise<{ id: string; created: boolean }>;
  redirectExists(sourcePath: string): Promise<boolean>;
  createDraft(input: {
    title: string;
    slug: string;
    excerpt?: string | null;
    contentMarkdown: string;
    categoryId?: string | null;
    tagIds?: string[];
  }): Promise<{ id: string; slug: string }>;
  updateDraft(
    postId: string,
    input: {
      contentMarkdown?: string;
      excerpt?: string | null;
      categoryId?: string | null;
      tagIds?: string[];
      coverAssetId?: string | null;
      ogAssetId?: string | null;
      seoTitle?: string | null;
      seoDescription?: string | null;
      createRevision?: boolean;
    }
  ): Promise<{ id: string; slug: string }>;
  publishPost(postId: string, publishedAt?: Date): Promise<void>;
  uploadLocalImage(input: {
    postId: string;
    absolutePath: string;
    altText?: string | null;
  }): Promise<{ publicUrl: string; assetId: string }>;
  createRedirect(sourcePath: string, targetPath: string): Promise<void>;
  resolveUserId(email?: string): Promise<string>;
};
