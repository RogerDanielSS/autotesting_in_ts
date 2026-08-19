import type { Post } from "../types/post";

/**
 * Base URL of the JSONPlaceholder API.
 * Override it with the VITE_API_BASE_URL environment variable
 * (e.g. when pointing the app at a local proxy).
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "https://jsonplaceholder.typicode.com";

/** Number of posts requested per page. */
export const POSTS_PER_PAGE = 10;

/** Error thrown by the API layer whenever a request does not succeed. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface FetchPostsParams {
  /** Index of the first post to fetch (0-based). */
  start?: number;
  /** Maximum number of posts to fetch. */
  limit?: number;
}

/**
 * Fetches a page of posts from JSONPlaceholder.
 * Pagination is done with the `_start` / `_limit` query parameters.
 */
export async function fetchPosts({
  start = 0,
  limit = POSTS_PER_PAGE,
}: FetchPostsParams = {}): Promise<Post[]> {
  const url = new URL("/posts", API_BASE_URL);
  url.searchParams.set("_start", String(start));
  url.searchParams.set("_limit", String(limit));

  const response = await fetch(url);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Failed to load posts (HTTP ${response.status}).`,
    );
  }

  return (await response.json()) as Post[];
}

/** Fetches a single post by its id. */
export async function fetchPost(id: number): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Failed to load post ${id} (HTTP ${response.status}).`,
    );
  }

  return (await response.json()) as Post;
}
