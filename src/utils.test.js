import { describe, expect, it } from "vitest";
import {
  channelOffset,
  colorsEqual,
  formatColor,
  generateOffsets,
  initializeGameState,
  offsetColor,
} from "./utils";

describe("offsetColor", () => {
  it("applies each offset scaled by the multiplier", () => {
    expect(offsetColor([100, 100, 100], [1, -1, 0], 10)).toEqual([110, 90, 100]);
  });

  it("returns the color unchanged for zero offsets", () => {
    expect(offsetColor([12, 34, 56], [0, 0, 0], 10)).toEqual([12, 34, 56]);
  });

  it("wraps below zero instead of going negative", () => {
    // 4x4 board at offsetMultiplier 20: -14 steps used to yield -14, which
    // formatted to the invalid "#-e0a0a".
    expect(offsetColor([0, 10, 10], [-14, 0, 0], 20)).toEqual([232, 10, 10]);
  });

  it("wraps above 255", () => {
    expect(offsetColor([250, 0, 0], [1, 0, 0], 10)).toEqual([4, 0, 0]);
  });

  it("stays in 0-255 across the whole config space", () => {
    const invalid = [];

    for (let channel = 0; channel < 256; channel++) {
      for (let offset = -50; offset <= 50; offset++) {
        for (const multiplier of [1, 5, 10, 20, 40]) {
          const result = offsetColor([channel, channel, channel], [offset, 0, -offset], multiplier);

          if (result.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) {
            invalid.push({ channel, offset, multiplier, result });
          }
        }
      }
    }

    expect(invalid).toEqual([]);
  });

  it("does not mutate its input", () => {
    const color = [10, 20, 30];
    offsetColor(color, [1, 1, 1], 10);
    expect(color).toEqual([10, 20, 30]);
  });
});

describe("channelOffset", () => {
  it("places the delta on the requested channel", () => {
    expect(channelOffset(0, 1)).toEqual([1, 0, 0]);
    expect(channelOffset(1, -1)).toEqual([0, -1, 0]);
    expect(channelOffset(2, 5)).toEqual([0, 0, 5]);
  });

  it("returns a fresh array each call", () => {
    expect(channelOffset(0, 1)).not.toBe(channelOffset(0, 1));
  });
});

describe("colorsEqual", () => {
  it("compares by value, not identity", () => {
    expect(colorsEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it("is false when any channel differs", () => {
    expect(colorsEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(colorsEqual([1, 2, 3], [9, 2, 3])).toBe(false);
  });

  it("is false when either side is missing", () => {
    expect(colorsEqual(null, [1, 2, 3])).toBe(false);
    expect(colorsEqual([1, 2, 3], undefined)).toBe(false);
    expect(colorsEqual(null, null)).toBe(false);
  });
});

describe("formatColor", () => {
  it("returns undefined for a missing color", () => {
    expect(formatColor(null)).toBeUndefined();
    expect(formatColor(undefined)).toBeUndefined();
  });

  it("zero-pads single-digit channels", () => {
    expect(formatColor([0, 5, 34])).toBe("#000522");
  });

  it("formats full-range channels", () => {
    expect(formatColor([255, 255, 255])).toBe("#ffffff");
  });

  it("round-trips back to the original channels", () => {
    for (let i = 0; i < 100; i++) {
      const color = [0, 0, 0].map(() => Math.floor(Math.random() * 256));
      const hex = formatColor(color);

      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
      expect([
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
      ]).toEqual(color);
    }
  });
});

describe("generateOffsets", () => {
  it("produces three integer offsets whose magnitudes sum to n", () => {
    for (let n = 0; n <= 20; n++) {
      for (let draw = 0; draw < 50; draw++) {
        const offsets = generateOffsets(n);

        expect(offsets).toHaveLength(3);
        for (const offset of offsets) {
          expect(Number.isInteger(offset)).toBe(true);
        }
        expect(offsets.reduce((sum, offset) => sum + Math.abs(offset), 0)).toBe(n);
      }
    }
  });
});

describe("initializeGameState", () => {
  it("seeds only the first tile and leaves the rest empty", () => {
    for (let i = 0; i < 200; i++) {
      const { colorTiles } = initializeGameState(8, 10);

      expect(colorTiles).toHaveLength(8);
      expect(colorTiles[0]).toHaveLength(3);
      for (const channel of colorTiles[0]) {
        expect(Number.isInteger(channel)).toBe(true);
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(255);
      }
      expect(colorTiles.slice(1)).toEqual(new Array(7).fill(null));
    }
  });

  it("produces a target color with valid channels", () => {
    for (let i = 0; i < 200; i++) {
      const { targetColor } = initializeGameState(8, 10);

      expect(targetColor).toHaveLength(3);
      for (const channel of targetColor) {
        expect(Number.isInteger(channel)).toBe(true);
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(255);
      }
    }
  });
});
