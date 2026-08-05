import { defineConfig, devices } from "@playwright/test";

const PORT = 5173;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // The specs read the board off the page and solve it, so what they are pointed at is what
  // gets proven. Under CI that is the built bundle, so the artifact a player downloads is the
  // one that gets played and axe-scanned — the dev server carries a DebugOverlay that exists
  // in no production build, and would otherwise sit in every accessibility scan. Locally the
  // dev server stays, since waiting on a build between iterations is not worth it.
  //
  // CI builds in its own step ahead of this; --strictPort keeps vite from wandering to another
  // port when one is already busy and leaving the run pointed at nothing.
  webServer: {
    command: process.env.CI
      ? `npm run preview -- --port ${PORT} --strictPort`
      : `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
