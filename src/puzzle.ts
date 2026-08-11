import { MAX_MOVES, STEP } from "./config";
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

const defaultRandomInt: RandomInt = (max) => Math.floor(Math.random() * (max + 1));

export function randomColor(randomInt: RandomInt = defaultRandomInt): Color {
  return randomInt(MAX_RGB_COLORS - 1);
}

function pickDirection(value: number, distance: number, randomInt: RandomInt) {
  const canIncrease = value + distance <= MAX_CHANNEL;
  const canDecrease = value - distance >= 0;

  if (canIncrease && canDecrease) {
    return randomInt(1) === 0 ? 1 : -1;
  }
  if (canIncrease || canDecrease) {
    return canIncrease ? 1 : -1;
  }

  return value < MAX_CHANNEL - value ? 1 : -1;
}

function headroomInMoves(value: number, step: number) {
  return Math.floor(Math.max(value, MAX_CHANNEL - value) / step);
}

function fitToHeadroom(magnitudes: number[], channels: number[], step: number) {
  const capacities = channels.map((value) => headroomInMoves(value, step));
  const fitted = [...magnitudes];

  for (let channel = 0; channel < fitted.length; channel++) {
    while (fitted[channel] > capacities[channel]) {
      const spare = fitted.findIndex((moves, i) => i !== channel && moves < capacities[i]);

      if (spare === -1) break;

      fitted[channel]--;
      fitted[spare]++;
    }
  }

  return fitted;
}

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

export function createPuzzle(seed?: number): Puzzle {
  const randomInt = createRandomInt(seed);
  const initialColor = randomColor(randomInt);
  const offsets = generateOffsets(MAX_MOVES, initialColor, STEP, randomInt);

  return {
    initialColor,
    targetColor: offsetColor(initialColor, offsets),
  };
}

export function dailySeed(date = new Date()): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY;
}

export function formatPuzzleDate(date: Date, locale?: string): string {
  let formatter = DATE_LABEL.get(locale);

  if (formatter === undefined) {
    formatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" });
    DATE_LABEL.set(locale, formatter);
  }

  return formatter.format(date);
}
