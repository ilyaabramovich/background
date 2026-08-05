import { GAME_CONFIG, MAX_MOVES } from "./config";
import { createRandomInt } from "./random";
import type { RandomInt } from "./random";
import { MAX_CHANNEL, colorToIntArray, offsetColor } from "./color";
import type { Color } from "./color";

type Puzzle = {
  initialColor: Color;
  targetColor: Color;
};

const MAX_RGB_COLORS = 16777216;
const DATE_LABEL = new Map<string | undefined, Intl.DateTimeFormat>();
const MS_PER_DAY = 86400000;

// Every draw goes through an injected randomInt(max) so a board can be rebuilt from a seed; see
// createRandomInt in random.ts. Unseeded play falls back to this, and max is inclusive.
const defaultRandomInt: RandomInt = (max) => Math.floor(Math.random() * (max + 1));

export function randomColor(randomInt: RandomInt = defaultRandomInt): Color {
  return randomInt(MAX_RGB_COLORS - 1);
}

// Now that channels clamp instead of wrapping, an offset that runs past 0 or 255 would
// produce a target no sequence of steps can reach. So the direction is chosen from the
// headroom the channel actually has rather than by coin flip.
function pickDirection(value: number, distance: number, randomInt: RandomInt) {
  const canIncrease = value + distance <= MAX_CHANNEL;
  const canDecrease = value - distance >= 0;

  if (canIncrease && canDecrease) {
    return randomInt(1) === 0 ? 1 : -1;
  }
  if (canIncrease || canDecrease) {
    return canIncrease ? 1 : -1;
  }

  // Only reached when the board asks for more moves than all three channels together can
  // absorb. The target is unreachable either way; take the roomier side.
  return value < MAX_CHANNEL - value ? 1 : -1;
}

// A channel always has at least half the range free on one side, so it can hold this many
// steps no matter which direction pickDirection ends up choosing.
function headroomInMoves(value: number, step: number) {
  return Math.floor(Math.max(value, MAX_CHANNEL - value) / step);
}

// The random three-way split above knows nothing about where the channels start, so it can
// hand a channel more steps than it can travel without clamping — and a clamped target is
// one no sequence of moves can reach. Overflow moves are passed to a channel that still has
// room, which keeps the total at moveCount and so keeps the target exactly that far away.
function fitToHeadroom(magnitudes: number[], channels: number[], step: number) {
  const capacities = channels.map((value) => headroomInMoves(value, step));
  const fitted = [...magnitudes];

  for (let channel = 0; channel < fitted.length; channel++) {
    while (fitted[channel] > capacities[channel]) {
      const spare = fitted.findIndex((moves, i) => i !== channel && moves < capacities[i]);

      // Only when the whole board asks for more than the color space can hold.
      if (spare === -1) break;

      fitted[channel]--;
      fitted[spare]++;
    }
  }

  return fitted;
}

// The order and count of draws below is what a seed reproduces, so changing it renumbers every
// past daily board. src/puzzle.test.ts pins the first thirty days against exactly that.
export function generateOffsets(
  moveCount: number,
  initialColor: Color,
  step = 1,
  randomInt: RandomInt = defaultRandomInt,
): number[] {
  const p1 = randomInt(moveCount);
  const p2 = randomInt(moveCount);

  const [min, max] = [p1, p2].sort((a, b) => a - b);
  const channels = colorToIntArray(initialColor);
  const magnitudes = fitToHeadroom([min, max - min, moveCount - max], channels, step);

  return magnitudes.map((magnitude, index) => {
    const distance = magnitude * step;

    return distance * pickDirection(channels[index], distance, randomInt);
  });
}

// One board, built from one generator. Everything a seed decides happens in here, which is what
// lets the golden test in puzzle.test.ts exercise the same path the app takes.
export function createPuzzle(seed?: number): Puzzle {
  const randomInt = createRandomInt(seed);
  const initialColor = randomColor(randomInt);
  const offsets = generateOffsets(MAX_MOVES, initialColor, GAME_CONFIG.offsetMultiplier, randomInt);

  return {
    initialColor,
    targetColor: offsetColor(initialColor, offsets),
  };
}

// The seed is the day number: how many days the calendar date sits from 1970-01-01. Consecutive
// days are always exactly one apart, with no jump across a month or year and no value in the
// range that no date can produce. The local year, month and day are read off the date and fed to
// Date.UTC, which lands on an exact multiple of a day whatever the player's zone is doing, so the
// division is never fractional and the board still turns over at their own midnight.
export function dailySeed(date = new Date()): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY;
}

// Formatters are expensive to build, so each locale gets one. Leaving locale undefined lets a
// player see the date the way their own system writes it. The year is left off: it costs the
// actions row enough width to wrap the buttons, and a board you are playing today does not need
// one to be clear.
export function formatPuzzleDate(date: Date, locale?: string): string {
  let formatter = DATE_LABEL.get(locale);

  if (formatter === undefined) {
    formatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
    DATE_LABEL.set(locale, formatter);
  }

  return formatter.format(date);
}
