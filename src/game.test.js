import { describe, expect, it } from "vitest";
import { generateOffsets, initializeGameState } from "./game";

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
  it("starts with a valid initial color and no moves made", () => {
    for (let i = 0; i < 200; i++) {
      const { initialColor, moves } = initializeGameState(7, 10);

      expect(moves).toEqual([]);
      expect(initialColor).toHaveLength(3);
      for (const channel of initialColor) {
        expect(Number.isInteger(channel)).toBe(true);
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(255);
      }
    }
  });

  it("produces a target color with valid channels", () => {
    for (let i = 0; i < 200; i++) {
      const { targetColor } = initializeGameState(7, 10);

      expect(targetColor).toHaveLength(3);
      for (const channel of targetColor) {
        expect(Number.isInteger(channel)).toBe(true);
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(255);
      }
    }
  });
});
