import fs from "node:fs";
import path from "node:path";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { ImportFromUrlForm } from "@/components/admin/import/import-from-url-form";

const REPORT_DIR = path.join(process.cwd(), ".import-reports");

function listRecentReports(limit = 5): string[] {
  if (!fs.existsSync(REPORT_DIR)) {
    return [];
  }

  return fs
    .readdirSync(REPORT_DIR)
    .filter((name) => name.endsWith(".json"))
    .map((name) => path.join(REPORT_DIR, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
    .slice(0, limit);
}

export default function AdminImportPage() {
  const recentReports = listRecentReports();

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Import"
        description="Import legacy content into PostForge as drafts."
      />

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Import from URL</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Paste the URL of a blog post you own or have permission to reuse. PostForge will create
            a draft using the source title, subtitle, content, and main image.
          </p>
        </div>
        <ImportFromUrlForm />
        <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--muted)]">
          <li>Imported posts are always saved as drafts.</li>
          <li>Only the main image is uploaded as a PostForge asset by default.</li>
          <li>Other inline images may remain as remote URLs.</li>
          <li>JavaScript-rendered pages may not import reliably.</li>
        </ul>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 className="text-lg font-semibold">GitHub Pages folder import</h2>
        <p className="text-sm text-[var(--muted)]">
          Migrate legacy Markdown folders using the CLI importer. See{" "}
          <code>docs/GITHUB_PAGES_MIGRATION.md</code> for supported frontmatter and safety defaults.
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>Export or copy your GitHub Pages/Jekyll Markdown folder locally.</li>
          <li>Run a dry-run import to validate metadata, slugs, images, and redirects.</li>
          <li>Review the JSON report in <code>.import-reports/</code>.</li>
          <li>Run import mode to create draft posts (default safety).</li>
          <li>Review imported drafts in Admin → Posts, then publish manually.</li>
        </ol>
        <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">
{`npm run import:github-pages -- --source ./legacy-blog --mode dry-run
npm run import:github-pages -- --source ./legacy-blog --mode import --assets ./legacy-blog/assets`}
        </pre>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 className="text-lg font-semibold">Recent import reports</h2>
        {recentReports.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No import reports found yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {recentReports.map((reportPath) => (
              <li key={reportPath}>
                <code>{path.basename(reportPath)}</code>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
