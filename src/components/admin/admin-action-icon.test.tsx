import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AdminActionIconButton, AdminActionIconLink } from "@/components/admin/admin-action-icon";

describe("admin action icons", () => {
  it("renders accessible link actions with title tooltips", () => {
    const html = renderToStaticMarkup(
      <AdminActionIconLink href="/admin/tags" icon="edit" label="Edit tag" title="Edit" />
    );

    expect(html).toContain('aria-label="Edit tag"');
    expect(html).toContain('title="Edit"');
  });

  it("renders destructive button actions with accessible labels", () => {
    const html = renderToStaticMarkup(
      <AdminActionIconButton icon="delete" label="Delete tag" title="Delete" destructive />
    );

    expect(html).toContain('aria-label="Delete tag"');
    expect(html).toContain('title="Delete"');
    expect(html).toContain("text-red-700");
  });
});
