import type { Post } from "../types/post";

interface PostCardProps {
  post: Post;
  onSelect: (postId: number) => void;
}

/** A single post teaser; the title acts as the entry point to the detail view. */
export function PostCard({ post, onSelect }: PostCardProps) {
  return (
    <article className="post-card">
      <h2 className="post-card__title">
        <button type="button" onClick={() => onSelect(post.id)}>
          {post.title}
        </button>
      </h2>
      <p className="post-card__body">{post.body}</p>
      <span className="post-card__author">Author #{post.userId}</span>
    </article>
  );
}
