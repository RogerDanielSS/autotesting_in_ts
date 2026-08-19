import { useEffect, useState } from "react";
import { fetchPost } from "../api/posts";
import type { Post } from "../types/post";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

interface PostDetailProps {
  postId: number;
  onBack: () => void;
}

/** Detail view for a single post, fetched on demand. */
export function PostDetail({ postId, onBack }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchPost(postId)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((error) => {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Something went wrong.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [postId, reloadCount]);

  const retry = () => {
    setErrorMessage(null);
    setPost(null);
    setReloadCount((count) => count + 1);
  };

  if (errorMessage !== null) {
    return <ErrorState message={errorMessage} onRetry={retry} />;
  }

  if (post === null) {
    return <LoadingState label="Loading post…" />;
  }

  return (
    <article className="post-detail">
      <button type="button" className="button button--ghost" onClick={onBack}>
        ← Back to posts
      </button>
      <header className="post-detail__header">
        <span className="post-detail__meta">
          Post #{post.id} · Author #{post.userId}
        </span>
        <h2 className="post-detail__title">{post.title}</h2>
      </header>
      <p className="post-detail__body">{post.body}</p>
    </article>
  );
}
