import { describe, expect, it } from "vitest";
import {
  colorToIntArray,
  formatColor,
  generateOffsets,
  offsetChannel,
  offsetColor,
  randomColor,
} from "./utils";

describe("offsetColor", () => {
  it("applies each offset to its own channel", () => {
    expect(offsetColor(0x646464, [10, -10, 0])).toBe(0x6e5a64);
  });

  it("returns the color unchanged for zero offsets", () => {
    expect(offsetColor(0x0c2238, [0, 0, 0])).toBe(0x0c2238);
  });

  it("clamps at zero instead of going negative", () => {
    expect(offsetColor(0x000a0a, [-24, 0, 0])).toBe(0x000a0a);
  });

  it("clamps at 255", () => {
    expect(offsetColor(0xfa0000, [10, 0, 0])).toBe(0xff0000);
  });

  it("does not bleed a clamped channel into its neighbours", () => {
    expect(offsetColor(0x00ff00, [0, 1, 0])).toBe(0x00ff00);
    expect(offsetColor(0x00ff00, [0, -256, 0])).toBe(0x000000);
  });

  it("stays in 0-255 across the whole config space", () => {
    const invalid = [];

    for (let channel = 0; channel < 256; channel++) {
      const color = (channel << 16) | (channel << 8) | channel;

      for (let offset = -50; offset <= 50; offset++) {
        for (const multiplier of [1, 5, 10, 20, 40]) {
          const amount = offset * multiplier;
          const result = colorToIntArray(offsetColor(color, [amount, 0, -amount]));

          if (result.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) {
            invalid.push({ channel, offset, multiplier, result });
          }
        }
      }
    }

    expect(invalid).toEqual([]);
  });
});

describe("offsetChannel", () => {
  it("changes only the requested channel", () => {
    expect(offsetChannel(0x646464, 0, 10)).toBe(0x6e6464);
    expect(offsetChannel(0x646464, 1, 10)).toBe(0x646e64);
    expect(offsetChannel(0x646464, 2, 10)).toBe(0x64646e);
  });

  it("clamps within the channel without bleeding into its neighbours", () => {
    expect(offsetChannel(0x00ff00, 1, 1)).toBe(0x00ff00);
    expect(offsetChannel(0xff00ff, 1, -1)).toBe(0xff00ff);
  });

  it("agrees with offsetColor for every channel", () => {
    const color = 0x123456;

    for (let channel = 0; channel < 3; channel++) {
      for (const amount of [-40, -10, 0, 10, 40]) {
        const offsets = [0, 0, 0];
        offsets[channel] = amount;

        expect(offsetChannel(color, channel, amount)).toBe(offsetColor(color, offsets));
      }
    }
  });
});

describe("formatColor", () => {
  it("zero-pads to six digits", () => {
    expect(formatColor(0x000000)).toBe("#000000");
    expect(formatColor(0x000522)).toBe("#000522");
  });

  it("formats full-range channels", () => {
    expect(formatColor(0xffffff)).toBe("#ffffff");
  });

  it("round-trips back to the original channels", () => {
    for (let i = 0; i < 100; i++) {
      const color = randomColor();
      const hex = formatColor(color);

      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
      expect([
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
      ]).toEqual(colorToIntArray(color));
    }
  });
});

describe("colorToIntArray", () => {
  it("unpacks the channels in red, green, blue order", () => {
    expect(colorToIntArray(0x0a141e)).toEqual([10, 20, 30]);
    expect(colorToIntArray(0x000000)).toEqual([0, 0, 0]);
    expect(colorToIntArray(0xffffff)).toEqual([255, 255, 255]);
  });
});

describe("randomColor", () => {
  it("produces integers inside the 24-bit color space", () => {
    for (let i = 0; i < 500; i++) {
      const color = randomColor();

      expect(Number.isInteger(color)).toBe(true);
      expect(color).toBeGreaterThanOrEqual(0);
      expect(color).toBeLessThanOrEqual(0xffffff);
    }
  });
});

describe("generateOffsets", () => {
  it("produces three integer offsets whose magnitudes sum to every move", () => {
    for (let moveCount = 0; moveCount <= 12; moveCount++) {
      for (const step of [1, 10]) {
        for (let draw = 0; draw < 50; draw++) {
          const offsets = generateOffsets(moveCount, randomColor(), step);

          expect(offsets).toHaveLength(3);
          for (const offset of offsets) {
            expect(Number.isInteger(offset)).toBe(true);
          }
          expect(offsets.reduce((sum, offset) => sum + Math.abs(offset), 0)).toBe(moveCount * step);
        }
      }
    }
  });

  // A channel with 128 of headroom can always absorb the offset in one direction or the
  // other, so every board up to that size must land its target strictly inside 0-255.
  it("never places the target past a channel edge", () => {
    const step = 10;

    for (let moveCount = 0; moveCount * step <= 128; moveCount++) {
      for (let draw = 0; draw < 100; draw++) {
        const initialColor = randomColor();
        const channels = colorToIntArray(initialColor);

        generateOffsets(moveCount, initialColor, step).forEach((offset, channel) => {
          const exact = channels[channel] + offset;

          expect(exact).toBeGreaterThanOrEqual(0);
          expect(exact).toBeLessThanOrEqual(255);
        });
      }
    }
  });

  it("leaves the target reachable in exactly moveCount steps", () => {
    const step = 10;
    const moveCount = 7;

    for (let draw = 0; draw < 200; draw++) {
      const initialColor = randomColor();
      const offsets = generateOffsets(moveCount, initialColor, step);
      const target = offsetColor(initialColor, offsets);

      let color = initialColor;
      let played = 0;

      offsets.forEach((offset, channel) => {
        for (let i = 0; i < Math.abs(offset) / step; i++) {
          color = offsetChannel(color, channel, Math.sign(offset) * step);
          played++;
        }
      });

      expect(color).toBe(target);
      expect(played).toBe(moveCount);
    }
  });
});
