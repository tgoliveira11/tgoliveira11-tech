import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPostAnalyticsRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/admin/analytics/posts/${id}`);
}
