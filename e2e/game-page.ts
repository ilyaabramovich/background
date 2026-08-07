import type { Page } from "@playwright/test";
import { GAME_CONFIG, MAX_MOVES } from "../src/config.js";
import { CHANNELS, colorToIntArray, offsetChannel, packColor } from "../src/color.js";
import type { Channel, Color } from "../src/color.js";

export type Move = {
  channel: Channel;
  delta: number;
};

const STEP = GAME_CONFIG.offsetMultiplier;
const COLORS =
  /Current color red (\d+), green (\d+), blue (\d+)\. Target color red (\d+), green (\d+), blue (\d+)\./;

export function heading(page: Page) {
  return page.getByRole("heading", { level: 1 });
}

// Everything below the heading is found by test id rather than by what it says or which ARIA
// attribute it carries, so that the specs asserting on that text and those attributes are the
// only place a change to either can fail. A locator that went looking for the aria-live
// paragraph could not then turn round and prove the paragraph is live.
export function status(page: Page) {
  return page.getByTestId("game-status");
}

// Always mounted, and empty until the game ends — the overlay it sits in is faded rather than
// unmounted. Assert on its text, never on toBeVisible, which an opacity-0 overlay still passes.
export function moveCounter(page: Page) {
  return page.getByTestId("move-counter");
}

export function announcer(page: Page) {
  return page.getByTestId("announcer");
}

export function controlPad(page: Page) {
  return page.getByTestId("control-pad");
}

// The buttons stay keyed to their accessible names. Those names are the whole interface for a
// pad of colored squares reading + and −, so a spec that stopped going through them would stop
// noticing when one goes missing.
export function button(page: Page, name: string) {
  return page.getByRole("button", { name });
}

// The board is drawn in color alone, so the running description written for screen readers is
// also the only text the game puts the two colors into — which makes it what a test reads to
// work out the moves that solve the board in front of it.
export async function readColors(page: Page) {
  const line = await announcer(page).textContent();
  // An empty locator and a line that does not parse are the same failure to a reader, so they
  // share the one throw below.
  const match = line === null ? null : COLORS.exec(line);

  if (match === null) {
    throw new Error(`Could not read the colors out of: ${line}`);
  }

  const [current, target] = [match.slice(1, 4), match.slice(4, 7)].map((channels) =>
    packColor(channels.map(Number)),
  );

  return { current, target };
}

function applyMoves(color: Color, moves: Move[]): Color {
  return moves.reduce((next, move) => offsetChannel(next, move.channel, move.delta * STEP), color);
}

// Every board is generated exactly MAX_MOVES single-channel steps away from its target, so the
// gap between the two colors spells the solution out: one click per step, in any order.
export function solution(current: Color, target: Color): Move[] {
  const distances = colorToIntArray(target).map(
    (value, channel) => (value - colorToIntArray(current)[channel]) / STEP,
  );

  if (!distances.every(Number.isInteger)) {
    throw new Error(`Target is not a whole number of ${STEP}-sized steps away: ${distances}`);
  }

  const moves = CHANNELS.flatMap(({ channel }) => {
    const steps = distances[channel];

    return Array.from({ length: Math.abs(steps) }, () => ({ channel, delta: Math.sign(steps) }));
  });

  if (moves.length !== MAX_MOVES) {
    throw new Error(`Board needs ${moves.length} moves, not the ${MAX_MOVES} it allows`);
  }

  return moves;
}

// A losing game still has to use every move, so it is the solution with the last step spent on
// something else. Clamping can make a wrong step land on the target anyway, so the substitute is
// checked against the color it actually produces rather than assumed to be wrong.
export function misplay(current: Color, target: Color): Move[] {
  const moves = solution(current, target);

  for (const { channel } of CHANNELS) {
    for (const delta of [1, -1]) {
      const candidate = [...moves.slice(0, -1), { channel, delta }];

      if (applyMoves(current, candidate) !== target) {
        return candidate;
      }
    }
  }

  throw new Error("Every move on this board wins, so it cannot be lost");
}

export async function play(page: Page, moves: Move[]) {
  for (const { channel, delta } of moves) {
    await button(page, `${delta > 0 ? "Increase" : "Decrease"} ${CHANNELS[channel].name}`).click();
  }
}

// Reading the board and then playing it out is how nearly every spec reaches the state it wants
// to assert on, so the three shapes that takes live here. Each returns the colors it read, since
// a caller that wants to compare against where the board started needs them from before the
// moves rather than after.
export async function playToWin(page: Page) {
  const colors = await readColors(page);

  await play(page, solution(colors.current, colors.target));

  return colors;
}

export async function playToLoss(page: Page) {
  const colors = await readColors(page);

  await play(page, misplay(colors.current, colors.target));

  return colors;
}

// Stops short, for a board that has to still be in play. Any count below MAX_MOVES walks the
// solution, which is also misplay's opening — the two only part company on the last move.
export async function playSomeMoves(page: Page, count: number) {
  const colors = await readColors(page);

  await play(page, solution(colors.current, colors.target).slice(0, count));

  return colors;
}
