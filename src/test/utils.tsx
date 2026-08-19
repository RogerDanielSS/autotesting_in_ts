import { render } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * Render helper for tests: renders a component wrapped in the same root
 * structure the app uses (here: nothing extra, but centralizing the helper
 * makes it easy to add providers later without touching every test).
 */
export function renderWithProviders(ui: ReactElement) {
  return render(ui);
}
