import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPostIndexPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/admin/posts/${id}/edit`);
}
