import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { MAX_MOVES } from "../src/config.js";
import { GAME_STATUS } from "../src/status.js";
import {
  announcer,
  button,
  heading,
  moveCounter,
  playSomeMoves,
  playToLoss,
  status,
} from "./game-page.js";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

function scan(page: Page) {
  return new AxeBuilder({ page }).withTags(TAGS).analyze();
}

async function expectNoViolations(page: Page) {
  const { violations } = await scan(page);

  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("the daily board has no accessibility violations", async ({ page }) => {
  await expectNoViolations(page);
});

test("a board in play has no accessibility violations", async ({ page }) => {
  await playSomeMoves(page, 3);

  await expectNoViolations(page);
});

test("a finished board has no accessibility violations", async ({ page }) => {
  await playToLoss(page);
  await expect(status(page)).toHaveText(GAME_STATUS.lost);

  await expectNoViolations(page);
});

test("free play has no accessibility violations", async ({ page }) => {
  await button(page, "New game").click();
  await expect(heading(page)).toHaveText("Free play");

  await expectNoViolations(page);
});

test("the page names itself once, at the top", async ({ page }) => {
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toHaveText(/^Daily puzzle · /);
});

test("every control names the channel it moves", async ({ page }) => {
  for (const name of ["red", "green", "blue"]) {
    await expect(button(page, `Increase ${name}`)).toBeVisible();
    await expect(button(page, `Decrease ${name}`)).toBeVisible();
  }

  await expect(page.getByRole("button")).toHaveCount(10);
});

test("the visible move counter stays out of the accessibility tree", async ({ page }) => {
  await expect(moveCounter(page)).toBeVisible();
  await expect(moveCounter(page)).toHaveAttribute("aria-hidden", "true");
});

test("the board reports its colors and remaining moves to a screen reader", async ({ page }) => {
  const live = announcer(page);

  await expect(live).toHaveAttribute("aria-live", "polite");
  await expect(live).toHaveText(/Current color red \d+, green \d+, blue \d+\./);
  await expect(live).toHaveText(new RegExp(`${MAX_MOVES} moves left\\.$`));

  await button(page, "Increase red").click();

  await expect(live).toHaveText(new RegExp(`${MAX_MOVES - 1} moves left\\.$`));
});

test("the controls are reached and fired from the keyboard", async ({ page }) => {
  const focused: (string | null)[] = [];

  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Tab");
    focused.push(
      await page.evaluate(
        () =>
          document.activeElement?.getAttribute("aria-label") ??
          document.activeElement?.textContent ??
          null,
      ),
    );
  }

  expect(focused).toEqual(["New game", "Increase red", "Increase green", "Increase blue"]);

  await page.keyboard.press("Enter");
  await expect(moveCounter(page)).toHaveText(`Moves: 1/${MAX_MOVES}`);
});
