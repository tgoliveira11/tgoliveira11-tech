import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { AdminTagsManager } from "@/components/admin/taxonomy/admin-tags-manager";
import * as tagsService from "@/modules/tags/tags.service";

export default async function AdminTagsPage() {
  const tags = await tagsService.listAdminTags();

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Tags"
        description="Manage tags used to organize posts. Tags with assigned posts cannot be deleted."
      />
      <AdminTagsManager tags={tags} />
    </div>
  );
}
