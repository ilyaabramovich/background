import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // exclude replaces vitest's defaults rather than extending them, so they are spread back
    // in: listing them by hand means anything vitest adds to that list later silently goes
    // missing here. e2e/ is Playwright's, and its specs only run under a browser it starts
    // itself.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
