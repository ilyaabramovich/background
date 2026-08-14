import type { Color } from "./color";
import type { RandomInt } from "./random";

import { MAX_CHANNEL } from "./color";
import { defaultRandomInt } from "./random";

const MS_PER_DAY = 86400000;

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
  const channels = initialColor.channels();
  const magnitudes = fitToHeadroom([min, max - min, moveCount - max], channels, step);

  return magnitudes.map((magnitude, index) => {
    const distance = magnitude * step;

    return distance * pickDirection(channels[index], distance, randomInt);
  });
}

export function dailySeed(date = new Date()): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY;
}
