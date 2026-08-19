import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("renders the error message inside an alert region", () => {
    render(<ErrorState message="Failed to load posts." onRetry={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed to load posts.",
    );
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });

  it("calls the retry callback when the button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorState message="Boom" onRetry={onRetry} />);
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
