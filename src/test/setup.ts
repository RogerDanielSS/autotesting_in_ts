import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "../mocks/server";
import { setNetworkDelay } from "../mocks/handlers";

// Speed up tests: the canonical handlers return instantly in the test env.
setNetworkDelay(0);

// Start the MSW Node server before any test in this file runs.
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

// Reset handlers and unmount rendered trees between tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => {
  server.close();
});
