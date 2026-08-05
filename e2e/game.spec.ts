import { expect, test } from "@playwright/test";
import { GAME_STATUS, MAX_MOVES } from "../src/config.js";
import {
  button,
  heading,
  misplay,
  moveCounter,
  play,
  readColors,
  solution,
  status,
} from "./game-page.js";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("wins the board when every move closes the gap to the target", async ({ page }) => {
  const { current, target } = await readColors(page);

  await play(page, solution(current, target));

  await expect(status(page)).toHaveText(GAME_STATUS.won);
  await expect(moveCounter(page)).toHaveText(`Moves: ${MAX_MOVES}/${MAX_MOVES}`);
  const finished = await readColors(page);
  expect(finished.current).toBe(finished.target);
});

test("loses the board when the last move is spent elsewhere", async ({ page }) => {
  const { current, target } = await readColors(page);

  await play(page, misplay(current, target));

  await expect(status(page)).toHaveText(GAME_STATUS.lost);
  const finished = await readColors(page);
  expect(finished.current).not.toBe(finished.target);
});

test("the controls stop taking moves once the game is over", async ({ page }) => {
  const { current, target } = await readColors(page);

  await play(page, misplay(current, target));

  await expect(status(page)).toBeVisible();
  // The pad is dimmed and inert rather than unmounted, so the tiles are still on the page and
  // still clickable as far as the test is concerned. The move has to go nowhere all the same.
  await expect(page.locator("div[inert]")).toBeVisible();
  await button(page, "Increase red").click({ force: true });
  await expect(moveCounter(page)).toHaveText(`Moves: ${MAX_MOVES}/${MAX_MOVES}`);
});

test("go back takes one move off and reset takes them all", async ({ page }) => {
  const start = await readColors(page);
  const goBack = button(page, "Go back");
  const reset = button(page, "Reset");

  await expect(goBack).toBeDisabled();
  await expect(reset).toBeDisabled();

  await play(page, solution(start.current, start.target).slice(0, 3));
  await expect(moveCounter(page)).toHaveText("Moves: 3/7");

  await goBack.click();
  await expect(moveCounter(page)).toHaveText("Moves: 2/7");

  await reset.click();
  await expect(moveCounter(page)).toHaveText("Moves: 0/7");
  await expect(goBack).toBeDisabled();
  expect(await readColors(page)).toEqual(start);
});

test("new game leaves the daily, and daily brings the same board back", async ({ page }) => {
  const daily = await heading(page).textContent();
  const dailyColors = await readColors(page);

  expect(daily).toMatch(/^Daily puzzle · /);
  await expect(button(page, "Daily")).toBeHidden();

  await button(page, "New game").click();
  await expect(heading(page)).toHaveText("Free play");

  // The daily board is seeded off the date, so coming back to it has to deal the same colors.
  await button(page, "Daily").click();
  // Non-null because the toMatch above has already failed the test if the heading had no text.
  await expect(heading(page)).toHaveText(daily!);
  expect(await readColors(page)).toEqual(dailyColors);
});
