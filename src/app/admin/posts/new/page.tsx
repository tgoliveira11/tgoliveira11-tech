import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { createDraftAction } from "@/modules/posts/admin-posts.actions";

export default function AdminNewPostPage() {
  return (
    <div>
      <AdminPageTitle
        title="New Post"
        description="Create a draft post project and open the editor."
      />
      <form action={createDraftAction}>
        <button
          type="submit"
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
        >
          Create Draft
        </button>
      </form>
      <p className="mt-4 text-sm text-[var(--muted)]">
        A new draft will be created and you will be redirected to the editor.
      </p>
    </div>
  );
}
