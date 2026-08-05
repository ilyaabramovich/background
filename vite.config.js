import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // e2e/ is Playwright's, and its specs only run under a browser it starts itself.
  test: {
    exclude: ["**/node_modules/**", "e2e/**"],
  },
});
