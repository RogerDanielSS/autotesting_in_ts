import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { API_BASE_URL } from "../api/posts";
import { mockPosts } from "../mocks/handlers";
import { renderWithProviders } from "../test/utils";
import { PostDetail } from "./PostDetail";

const onBack = vi.fn();

describe("PostDetail", () => {
  it("fetches and renders the selected post", async () => {
    renderWithProviders(<PostDetail postId={1} onBack={onBack} />);

    expect(
      await screen.findByRole("heading", { name: mockPosts[0].title }),
    ).toBeInTheDocument();
    expect(screen.getByText(mockPosts[0].body)).toBeInTheDocument();
    expect(screen.getByText("Post #1 · Author #1")).toBeInTheDocument();
  });

  it("shows an error when the post cannot be loaded", async () => {
    server.use(
      http.get(`${API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ message: "Not found" }, { status: 404 }),
      ),
    );

    renderWithProviders(<PostDetail postId={999} onBack={onBack} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to load post 999",
    );
  });

  it("calls onBack when the back button is clicked", async () => {
    const user = userEvent.setup();

    renderWithProviders(<PostDetail postId={1} onBack={onBack} />);
    await screen.findByRole("heading", { name: mockPosts[0].title });

    await user.click(screen.getByRole("button", { name: /back to posts/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
