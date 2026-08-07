import Link from "next/link";
import { resolveMediaUrl } from "@/lib/media/url";
import type { Post } from "@/types/post";

interface PostCardProps { post: Post; isList?: boolean }

export const PostCard = ({ post }: PostCardProps) => {
  const date = post.publishedAt || post.createdAt
    ? new Intl.DateTimeFormat("vi-VN", { year: "numeric", month: "short", day: "numeric" }).format(new Date(post.publishedAt || post.createdAt))
    : "Gần đây";
  const href = `/posts/${post.slug}`;

  return (
    <article className="blog_post_block image_left_layout">
      <div className="blog_post_image">
        <Link className="image_wrap" href={href} aria-label={`Đọc ${post.title}`}>
          {post.thumbnail ? <img src={resolveMediaUrl(post.thumbnail)} alt={post.title} /> : <img src="/edubost-reference/img/blog/blog_07.jpg" alt="" />}
        </Link>
      </div>
      <div className="blog_post_content">
        <div className="post_meta_wrap">
          <ul className="category_btns_group unordered_list"><li><Link href={`/posts?category=${post.category?.slug || ""}`}>#{post.category?.name || "Bài viết"}</Link></li></ul>
          <ul className="post_meta unordered_list"><li><Link href={href}><i className="far fa-clock" aria-hidden="true" /> {date}</Link></li></ul>
        </div>
        <h3 className="blog_post_title border-effect"><Link href={href}>{post.title}</Link></h3>
        <p className="blog_post_description">{post.excerpt || "Nội dung bài viết đang được cập nhật."}</p>
        <ul className="post_meta_bottom ul_li">
          <li><img src="/edubost-reference/img/blog/avatar1.png" alt="" />{post.author?.userName || "GATS Academy"}</li>
          <li><i className="far fa-comment" aria-hidden="true" />0 bình luận</li>
        </ul>
      </div>
    </article>
  );
};
