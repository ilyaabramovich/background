import type { Page } from "@playwright/test";
import { GAME_CONFIG, GAME_STATUS, MAX_MOVES } from "../src/config.js";
import { CHANNELS, colorToIntArray, offsetChannel } from "../src/utils.js";
import type { Channel, Color } from "../src/utils.js";

// One click: a channel to move and which way. delta stays a plain number because solution
// builds it out of Math.sign, and applyMoves only ever multiplies it by STEP.
export type Move = {
  channel: Channel;
  delta: number;
};

const STEP = GAME_CONFIG.offsetMultiplier;
const COLORS =
  /Current color red (\d+), green (\d+), blue (\d+)\. Target color red (\d+), green (\d+), blue (\d+)\./;

function packColor([red, green, blue]: number[]): Color {
  return (red << 16) | (green << 8) | blue;
}

export function heading(page: Page) {
  return page.getByRole("heading", { level: 1 });
}

export function status(page: Page) {
  return page.getByText(GAME_STATUS.won).or(page.getByText(GAME_STATUS.lost));
}

export function moveCounter(page: Page) {
  return page.getByText(/^Moves: \d+\/\d+$/);
}

export function button(page: Page, name: string) {
  return page.getByRole("button", { name });
}

// The board is drawn in color alone, so the running description written for screen readers is
// also the only text the game puts the two colors into — which makes it what a test reads to
// work out the moves that solve the board in front of it.
export async function readColors(page: Page) {
  const line = await page.locator("p[aria-live=polite]").textContent();
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
