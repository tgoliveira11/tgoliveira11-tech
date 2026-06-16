import type { UrlPostImportReport } from "@/modules/import/url-post-importer.types";

export function ImportReportSummary({ report }: { report: UrlPostImportReport }) {
  if (report.warnings.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">Import notes</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {report.warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}
