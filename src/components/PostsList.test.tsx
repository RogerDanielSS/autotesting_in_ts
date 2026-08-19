import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { API_BASE_URL } from "../api/posts";
import { mockPosts, setNetworkDelay } from "../mocks/handlers";
import { renderWithProviders } from "../test/utils";
import { PostsList } from "./PostsList";

const firstPage = mockPosts.slice(0, 10);
const onSelectPost = vi.fn();

describe("PostsList", () => {
  it("shows a loading state while the first page is being fetched", async () => {
    // A small latency makes the loading state observable and deterministic.
    setNetworkDelay(120);

    try {
      renderWithProviders(<PostsList onSelectPost={onSelectPost} />);

      expect(screen.getByRole("status")).toHaveTextContent("Loading posts…");
      expect(
        await screen.findByRole("heading", { name: firstPage[0].title }),
      ).toBeInTheDocument();
    } finally {
      setNetworkDelay(0);
    }
  });

  it("renders the first page of posts once loaded", async () => {
    renderWithProviders(<PostsList onSelectPost={onSelectPost} />);

    const firstCard = await screen.findByRole("heading", {
      name: firstPage[0].title,
    });
    expect(firstCard).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(10);
    expect(screen.getByTestId("posts-count")).toHaveTextContent("10 posts");
  });

  it('shows an error and recovers when "Try again" is clicked', async () => {
    const user = userEvent.setup();

    let shouldFail = true;
    server.use(
      http.get(`${API_BASE_URL}/posts`, () => {
        if (shouldFail) {
          shouldFail = false;
          return HttpResponse.json({ message: "boom" }, { status: 500 });
        }
        return HttpResponse.json(firstPage);
      }),
    );

    renderWithProviders(<PostsList onSelectPost={onSelectPost} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to load posts",
    );

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("heading", { name: firstPage[0].title }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("filters posts by title as the user types", async () => {
    const user = userEvent.setup();

    renderWithProviders(<PostsList onSelectPost={onSelectPost} />);
    await screen.findByRole("heading", { name: firstPage[0].title });

    await user.type(screen.getByRole("searchbox"), "Mock post 3:");

    expect(
      screen.getByRole("heading", { name: mockPosts[2].title }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: firstPage[0].title }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("posts-count")).toHaveTextContent(
      "Showing 1 of 10 posts",
    );
  });

  it("shows an empty message when the search has no matches", async () => {
    const user = userEvent.setup();

    renderWithProviders(<PostsList onSelectPost={onSelectPost} />);
    await screen.findByRole("heading", { name: firstPage[0].title });

    await user.type(screen.getByRole("searchbox"), "zzzz-no-match");

    expect(screen.getByText(/no posts match/i)).toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });

  it("loads more posts when the button is clicked", async () => {
    const user = userEvent.setup();

    renderWithProviders(<PostsList onSelectPost={onSelectPost} />);
    await screen.findByRole("heading", { name: firstPage[0].title });
    expect(screen.getAllByRole("article")).toHaveLength(10);

    await user.click(screen.getByRole("button", { name: "Load more posts" }));

    expect(
      await screen.findByRole("heading", { name: mockPosts[10].title }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(20);
    expect(screen.getByTestId("posts-count")).toHaveTextContent("20 posts");
  });

  it('hides the "Load more" button once all posts are loaded', async () => {
    const user = userEvent.setup();

    renderWithProviders(<PostsList onSelectPost={onSelectPost} />);
    await screen.findByRole("heading", { name: firstPage[0].title });

    // 25 mock posts in total: two full pages (10 + 10) and one partial (5).
    await user.click(screen.getByRole("button", { name: "Load more posts" }));
    await screen.findByRole("heading", { name: mockPosts[10].title });

    await user.click(screen.getByRole("button", { name: "Load more posts" }));
    await screen.findByRole("heading", { name: mockPosts[20].title });

    expect(screen.getAllByRole("article")).toHaveLength(25);
    expect(
      screen.queryByRole("button", { name: "Load more posts" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("posts-count")).toHaveTextContent("25 posts");
  });
});
