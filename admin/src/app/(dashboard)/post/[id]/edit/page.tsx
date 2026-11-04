import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostDetail } from "../../actions";
import { PostFormPage } from "../../_components/post-form-page";

export const metadata: Metadata = {
  title: "Sửa bài viết",
};

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const post = await getPostDetail(id);

  if (!post) {
    notFound();
  }

  return <PostFormPage mode="edit" post={post} />;
}
