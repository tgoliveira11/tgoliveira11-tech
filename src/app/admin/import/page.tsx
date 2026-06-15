import fs from "node:fs";
import path from "node:path";
import { AdminPageTitle } from "@/components/admin/admin-page-title";

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
        title="GitHub Pages import"
        description="Migrate legacy Markdown posts into PostForge using the CLI importer."
      />

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 className="text-lg font-semibold">Recommended workflow</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>Export or copy your GitHub Pages/Jekyll Markdown folder locally.</li>
          <li>Run a dry-run import to validate metadata, slugs, images, and redirects.</li>
          <li>Review the JSON report in <code>.import-reports/</code>.</li>
          <li>Run import mode to create draft posts (default safety).</li>
          <li>Review imported drafts in Admin → Posts, then publish manually.</li>
        </ol>
        <p className="text-sm text-[var(--muted)]">
          See <code>docs/GITHUB_PAGES_MIGRATION.md</code> in the repository for supported frontmatter, safety defaults,
          and troubleshooting.
        </p>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 className="text-lg font-semibold">CLI commands</h2>
        <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">
{`npm run import:github-pages -- --source ./legacy-blog --mode dry-run
npm run import:github-pages -- --source ./legacy-blog --mode import --assets ./legacy-blog/assets`}
        </pre>
        <p className="text-xs text-[var(--muted)]">
          Imported posts default to draft. Use <code>--publish-imported true</code> only when you explicitly want
          automatic publishing.
        </p>
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
