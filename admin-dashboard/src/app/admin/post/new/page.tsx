import type { Metadata } from "next";
import { PostFormPage } from "../_components/post-form-page";

export const metadata: Metadata = {
  title: "Thêm bài viết",
};

export default function NewPostPage() {
  return <PostFormPage mode="create" />;
}
