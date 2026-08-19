import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";
import { API_BASE_URL } from "../api/posts";
import { handlers } from "./handlers";

/**
 * Browser-side MSW worker.
 *
 * Started from `main.tsx` only when VITE_ENABLE_MSW=true, which makes the app
 * fully deterministic in development and during Playwright E2E runs (no real
 * network traffic to JSONPlaceholder).
 */
export const worker = setupWorker(...handlers);

declare global {
  interface Window {
    /** E2E hook: make every /posts request fail with HTTP 500. */
    __mswFailPosts?: () => void;
    /** E2E hook: restore the canonical handlers. */
    __mswReset?: () => void;
  }
}

/**
 * Exposes a minimal control surface on `window` so Playwright tests can flip
 * the mock network state at runtime (e.g. simulate a backend outage) without
 * restarting the dev server.
 */
export function exposeMswControl(): void {
  if (typeof window === "undefined") return;

  window.__mswFailPosts = () => {
    worker.use(
      http.get(`${API_BASE_URL}/posts`, () =>
        HttpResponse.json({ message: "Simulated outage" }, { status: 500 }),
      ),
    );
  };

  window.__mswReset = () => {
    worker.resetHandlers();
  };
}
