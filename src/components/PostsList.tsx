import { useEffect, useState } from "react";
import { fetchPosts, POSTS_PER_PAGE } from "../api/posts";
import type { Post } from "../types/post";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { PostCard } from "./PostCard";

interface PostsListProps {
  onSelectPost: (postId: number) => void;
}

/** Paginated, searchable list of posts. */
export function PostsList({ onSelectPost }: PostsListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchPosts({ start: 0, limit: POSTS_PER_PAGE })
      .then((page) => {
        if (cancelled) return;
        setPosts(page);
        setHasMore(page.length === POSTS_PER_PAGE);
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
  }, [reloadCount]);

  const retry = () => {
    setErrorMessage(null);
    setReloadCount((count) => count + 1);
  };

  const loadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadMoreError("");
    try {
      const nextPage = await fetchPosts({
        start: posts.length,
        limit: POSTS_PER_PAGE,
      });
      setPosts((current) => [...current, ...nextPage]);
      setHasMore(nextPage.length === POSTS_PER_PAGE);
    } catch (error) {
      setLoadMoreError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const isSearching = normalizedSearch.length > 0;
  const visiblePosts = isSearching
    ? posts.filter((post) =>
        post.title.toLowerCase().includes(normalizedSearch),
      )
    : posts;

  if (errorMessage !== null) {
    return <ErrorState message={errorMessage} onRetry={retry} />;
  }

  if (posts.length === 0) {
    return <LoadingState label="Loading posts…" />;
  }

  return (
    <section className="posts" aria-label="Posts">
      <div className="posts__toolbar">
        <label className="posts__search">
          <span className="visually-hidden">Search posts by title</span>
          <input
            type="search"
            placeholder="Search posts by title…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
        <span className="posts__count" data-testid="posts-count">
          {isSearching
            ? `Showing ${visiblePosts.length} of ${posts.length} posts`
            : `${posts.length} posts`}
        </span>
      </div>

      {visiblePosts.length === 0 ? (
        <p className="posts__empty">No posts match “{searchTerm.trim()}”.</p>
      ) : (
        <div className="posts__grid">
          {visiblePosts.map((post) => (
            <PostCard key={post.id} post={post} onSelect={onSelectPost} />
          ))}
        </div>
      )}

      {!isSearching && (
        <div className="posts__pagination">
          {loadMoreError && (
            <ErrorState
              message={loadMoreError}
              onRetry={() => void loadMore()}
            />
          )}
          {hasMore && !loadMoreError && (
            <button
              type="button"
              className="button"
              onClick={() => void loadMore()}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading more…" : "Load more posts"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
