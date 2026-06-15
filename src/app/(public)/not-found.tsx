import { PublicLayout } from "@/components/public/public-layout";
import { PublicActionLinks } from "@/components/public/public-breadcrumbs";
import { PublicEmptyState } from "@/components/public/public-empty-state";
import { getBlogConfig } from "@/modules/public/blog-config";

export default async function PublicNotFound() {
  const config = await getBlogConfig();

  return (
    <PublicLayout config={config}>
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center py-16 text-center">
        <PublicEmptyState
          title="Page not found"
          description="The page you're looking for may have moved or no longer exists."
        >
          <PublicActionLinks
            links={[
              { href: "/", label: "Go home", variant: "primary" },
              { href: "/blog", label: "Browse posts", variant: "secondary" },
              { href: "/search", label: "Search", variant: "secondary" },
            ]}
          />
        </PublicEmptyState>
      </div>
    </PublicLayout>
  );
}
