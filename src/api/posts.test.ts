import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { mockPosts } from "../mocks/handlers";
import { API_BASE_URL, ApiError, fetchPost, fetchPosts } from "./posts";

describe("fetchPosts", () => {
  it("returns a page of posts", async () => {
    const posts = await fetchPosts({ start: 0, limit: 3 });

    expect(posts).toHaveLength(3);
    expect(posts[0]).toEqual(mockPosts[0]);
    expect(posts[2]).toEqual(mockPosts[2]);
  });

  it("honours the _start / _limit pagination params", async () => {
    const posts = await fetchPosts({ start: 10, limit: 5 });

    expect(posts).toHaveLength(5);
    expect(posts[0]).toEqual(mockPosts[10]);
  });

  it("throws an ApiError with the status code on failure", async () => {
    server.use(
      http.get(`${API_BASE_URL}/posts`, () =>
        HttpResponse.json({ message: "boom" }, { status: 500 }),
      ),
    );

    await expect(fetchPosts()).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
    } satisfies Partial<ApiError>);
  });
});

describe("fetchPost", () => {
  it("returns the requested post", async () => {
    const post = await fetchPost(1);

    expect(post).toEqual(mockPosts[0]);
  });

  it("throws an ApiError when the post does not exist", async () => {
    await expect(fetchPost(9999)).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
    } satisfies Partial<ApiError>);
  });
});
