import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL, POSTS_PER_PAGE } from "../api/posts";
import type { Post } from "../types/post";

/**
 * Canonical mock dataset shared by the Node test server and the browser worker.
 *
 * It intentionally mimics the JSONPlaceholder data shape while being fully
 * deterministic, so every test run sees the exact same posts.
 */
export const mockPosts: Post[] = Array.from({ length: 25 }, (_, index) => {
  const id = index + 1;
  return {
    userId: (index % 5) + 1,
    id,
    title: `Mock post ${id}: a title for automated testing`,
    body:
      `This is the body of mock post ${id}. ` +
      "It contains enough text to render a card and to exercise search, " +
      "filtering and pagination scenarios in the automated tests.",
  };
});

/**
 * Simulated network latency, in milliseconds.
 *
 * Mutable on purpose: unit/integration tests set it to `0` for speed, while the
 * browser worker (dev mode / E2E) keeps a small delay so loading states are
 * visible and exercised.
 */
export let networkDelay = 300;

export function setNetworkDelay(ms: number): void {
  networkDelay = ms;
}

export const handlers = [
  // GET /posts?_start=0&_limit=10 -> first page
  // GET /posts?_start=10&_limit=10 -> second page, etc.
  http.get(`${API_BASE_URL}/posts`, async ({ request }) => {
    const url = new URL(request.url);
    const start = Number(url.searchParams.get("_start") ?? 0);
    const limit = Number(url.searchParams.get("_limit") ?? POSTS_PER_PAGE);

    await delay(networkDelay);

    return HttpResponse.json(mockPosts.slice(start, start + limit));
  }),

  // GET /posts/:id -> single post, 404 when unknown
  http.get(`${API_BASE_URL}/posts/:id`, async ({ params }) => {
    const id = Number(params.id);

    await delay(networkDelay);

    const post = mockPosts.find((item) => item.id === id);
    if (!post) {
      return HttpResponse.json(
        { message: `Post ${id} not found` },
        { status: 404 },
      );
    }

    return HttpResponse.json(post);
  }),
];
