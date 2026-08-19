import { expect, test } from "@playwright/test";

/** * E2E control surface exposed by the MSW browser worker (src/mocks/browser.ts)
 * when the app runs with VITE_ENABLE_MSW=true.
 */
declare global {
  interface Window {
    __mswFailPosts?: () => void;
    __mswReset?: () => void;
  }
}

/** * End-to-end tests for the Post Explorer.
 *
 * The dev server is started with VITE_ENABLE_MSW=true (see playwright.config),
 * so the MSW browser worker serves all API responses — the tests never touch
 * the real JSONPlaceholder service.
 */

test("loads the first page of posts and shows the post count", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Post Explorer" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: /Mock post 1:/ }),
  ).toBeVisible();
  await expect(page.getByTestId("posts-count")).toHaveText("10 posts");
  await expect(page.getByRole("article")).toHaveCount(10);
});

test("navigates from the list to the post detail and back", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Mock post 1:/ }).click();

  await expect(
    page.getByRole("button", { name: /back to posts/i }),
  ).toBeVisible();
  await expect(page.getByText("Post #1 · Author #1")).toBeVisible();
  await expect(
    page.getByText(/This is the body of mock post 1\./),
  ).toBeVisible();

  await page.getByRole("button", { name: /back to posts/i }).click();

  await expect(page.getByTestId("posts-count")).toHaveText("10 posts");
});

test("filters posts with the search box", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Mock post 1:/ }),
  ).toBeVisible();

  await page.getByRole("searchbox").fill("Mock post 3:");

  await expect(
    page.getByRole("heading", { name: /Mock post 3:/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Mock post 1:/ }),
  ).toBeHidden();
  await expect(page.getByTestId("posts-count")).toHaveText(
    "Showing 1 of 10 posts",
  );

  await page.getByRole("searchbox").fill("no-such-post");

  await expect(page.getByText(/no posts match/i)).toBeVisible();
});

test("recovers from a backend failure when the user retries", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Mock post 1:/ }),
  ).toBeVisible();

  // Simulate a backend outage for subsequent /posts requests.
  await page.evaluate(() => window.__mswFailPosts?.());

  await page.getByRole("button", { name: "Load more posts" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Failed to load posts");

  // Backend recovers: the retry succeeds and appends the second page.
  await page.evaluate(() => window.__mswReset?.());
  await page.getByRole("button", { name: "Try again" }).click();

  await expect(page.getByTestId("posts-count")).toHaveText("20 posts");
  await expect(page.getByRole("article")).toHaveCount(20);
});
