import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

/**
 * Starts the MSW browser worker before rendering when VITE_ENABLE_MSW=true.
 *
 *   VITE_ENABLE_MSW=true npm run dev
 *
 * This makes the app fully offline/deterministic — handy during development
 * and required by the Playwright E2E suite.
 */
async function enableMocking(): Promise<void> {
  if (import.meta.env.VITE_ENABLE_MSW !== "true") return;

  const { worker, exposeMswControl } = await import("./mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
  exposeMswControl();
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
