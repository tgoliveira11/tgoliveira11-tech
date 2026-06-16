import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { AdminCategoriesManager } from "@/components/admin/taxonomy/admin-categories-manager";
import * as categoriesService from "@/modules/categories/categories.service";

export default async function AdminCategoriesPage() {
  const categories = await categoriesService.listAdminCategories();

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Categories"
        description="Manage categories used to group posts. Categories with assigned posts cannot be deleted."
      />
      <AdminCategoriesManager categories={categories} />
    </div>
  );
}
