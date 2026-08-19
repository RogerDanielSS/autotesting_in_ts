import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * Node-side MSW server used by Vitest (unit/integration tests).
 *
 * The server is started/stopped once per test file and reset between tests;
 * that lifecycle lives in `src/test/setup.ts`.
 */
export const server = setupServer(...handlers);
