import type { Page } from "@playwright/test";

import type { Channel } from "../src/color.js";

import { CHANNELS, Color } from "../src/color.js";
import { STEP, MAX_MOVES } from "../src/config.js";

export type Move = {
  channel: Channel;
  delta: number;
};

const COLORS =
  /Current color red (\d+), green (\d+), blue (\d+)\. Target color red (\d+), green (\d+), blue (\d+)\./;

export function heading(page: Page) {
  return page.getByRole("heading", { level: 1 });
}

export function status(page: Page) {
  return page.getByTestId("game-status");
}

export function moveCounter(page: Page) {
  return page.getByTestId("move-counter");
}

export function announcer(page: Page) {
  return page.getByTestId("announcer");
}

export function controlPad(page: Page) {
  return page.getByTestId("control-pad");
}

export function button(page: Page, name: string) {
  return page.getByRole("button", { name });
}

export async function readColors(page: Page) {
  const line = await announcer(page).textContent();
  const match = line === null ? null : COLORS.exec(line);

  if (match === null) {
    throw new Error(`Could not read the colors out of: ${line}`);
  }

  const [current, target] = [match.slice(1, 4), match.slice(4, 7)].map((channels) =>
    Color.pack(channels.map(Number)),
  );

  return { current, target };
}

function applyMoves(color: Color, moves: Move[]): Color {
  return moves.reduce((next, move) => next.offsetChannel(move.channel, move.delta * STEP), color);
}

export function solution(current: Color, target: Color): Move[] {
  const distances = CHANNELS.map(
    ({ channel }) => (target.channelAt(channel) - current.channelAt(channel)) / STEP,
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

export function misplay(current: Color, target: Color): Move[] {
  const moves = solution(current, target);

  for (const { channel } of CHANNELS) {
    for (const delta of [1, -1]) {
      const candidate = [...moves.slice(0, -1), { channel, delta }];

      if (!applyMoves(current, candidate).equals(target)) {
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

export async function playSomeMoves(page: Page, count: number) {
  const colors = await readColors(page);

  await play(page, solution(colors.current, colors.target).slice(0, count));

  return colors;
}
