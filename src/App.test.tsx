import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockPosts } from "./mocks/handlers";
import { renderWithProviders } from "./test/utils";
import App from "./App";

describe("App", () => {
  it("navigates from the post list to the detail view and back", async () => {
    const user = userEvent.setup();
    const targetPost = mockPosts[0];

    renderWithProviders(<App />);

    // List view
    expect(
      await screen.findByRole("heading", { name: targetPost.title }),
    ).toBeInTheDocument();

    // Open the detail view from the post card title button
    await user.click(screen.getByRole("button", { name: targetPost.title }));

    expect(
      await screen.findByRole("button", { name: /back to posts/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(targetPost.body)).toBeInTheDocument();

    // Go back to the list
    await user.click(screen.getByRole("button", { name: /back to posts/i }));

    expect(
      await screen.findByRole("heading", { name: targetPost.title }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("posts-count")).toHaveTextContent("10 posts");
  });
});
