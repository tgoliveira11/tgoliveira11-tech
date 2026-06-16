import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

import { PostFilters } from "@/components/admin/posts/post-filters";

describe("PostFilters", () => {
  it("renders the total posts counter inside the filters card", () => {
    const html = renderToStaticMarkup(
      <PostFilters
        categories={[]}
        tags={[]}
        current={{}}
        totalItems={20}
        hasActiveFilters={false}
      />
    );

    expect(html).toContain("20 total posts");
    expect(html).toContain("Apply filters");
    expect(html).toContain('href="/admin/posts"');
  });

  it("shows filtered count label when filters are active", () => {
    const html = renderToStaticMarkup(
      <PostFilters
        categories={[]}
        tags={[]}
        current={{ search: "hello" }}
        totalItems={7}
        hasActiveFilters
      />
    );

    expect(html).toContain("7 posts found");
  });

  it("uses singular labels", () => {
    const totalHtml = renderToStaticMarkup(
      <PostFilters
        categories={[]}
        tags={[]}
        current={{}}
        totalItems={1}
        hasActiveFilters={false}
      />
    );
    const filteredHtml = renderToStaticMarkup(
      <PostFilters
        categories={[]}
        tags={[]}
        current={{ status: "draft" }}
        totalItems={1}
        hasActiveFilters
      />
    );

    expect(totalHtml).toContain("1 total post");
    expect(filteredHtml).toContain("1 post found");
  });
});
