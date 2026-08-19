import { useState } from "react";
import { PostDetail } from "./components/PostDetail";
import { PostsList } from "./components/PostsList";

/**
 * Post Explorer — a small JSONPlaceholder-backed app whose purpose is to
 * demonstrate the three automated testing layers:
 *
 *   1. Unit & integration  -> Vitest + React Testing Library
 *   2. API mocking         -> Mock Service Worker (MSW)
 *   3. End-to-end          -> Playwright
 *
 * Navigation is deliberately state-based (no router dependency).
 */
export default function App() {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  return (
    <main className="app">
      <header className="app__header">
        <div className="app__header-inner">
          <span className="app__badge">Testing demo</span>
          <h1>Post Explorer</h1>
          <p className="app__tagline">
            A React + TypeScript app consuming the JSONPlaceholder API, covered
            by unit, integration and end-to-end tests.
          </p>
        </div>
      </header>

      {selectedPostId === null ? (
        <PostsList onSelectPost={setSelectedPostId} />
      ) : (
        <PostDetail
          postId={selectedPostId}
          onBack={() => setSelectedPostId(null)}
        />
      )}

      <footer className="app__footer">
        <p>
          Data served by the MSW mock handlers —{" "}
          <code>src/mocks/handlers.ts</code>
        </p>
      </footer>
    </main>
  );
}
