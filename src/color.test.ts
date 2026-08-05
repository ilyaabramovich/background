import { describe, expect, it } from "vitest";
import {
  CHANNELS,
  colorToIntArray,
  contrastingColor,
  describeColor,
  formatColor,
  mixColors,
  offsetChannel,
  offsetColor,
} from "./color";

// Just a source of arbitrary colors to push through the algebra. Local rather than the game's
// own randomColor, which lives with board generation now and is not what any of this is testing.
const randomColor = () => Math.floor(Math.random() * 0x1000000);

// WCAG relative luminance and contrast ratio, recomputed here rather than reusing the
// implementation, so a mistake in color.ts cannot agree with itself. One copy: a second would
// be a second place for the reference to be wrong.
const luminance = (colorInt: number) =>
  colorToIntArray(colorInt)
    .map((value) => {
      const c = value / 255;

      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, c, i) => sum + [0.2126, 0.7152, 0.0722][i] * c, 0);

const ratio = (a: number, b: number) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (hi + 0.05) / (lo + 0.05);
};

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

    for (const { channel } of CHANNELS) {
      for (const amount of [-40, -10, 0, 10, 40]) {
        const offsets = [0, 0, 0];
        offsets[channel] = amount;

        expect(offsetChannel(color, channel, amount)).toBe(offsetColor(color, offsets));
      }
    }
  });
});

describe("contrastingColor", () => {
  it("returns white on dark colors and black on light ones", () => {
    expect(contrastingColor(0x000000)).toBe(0xffffff);
    expect(contrastingColor(0xffffff)).toBe(0x000000);
    expect(contrastingColor(0x0000ff)).toBe(0xffffff); // blue reads dark
    expect(contrastingColor(0x00ff00)).toBe(0x000000); // green reads light
  });

  it("always picks whichever of black or white contrasts more", () => {
    for (let i = 0; i < 500; i++) {
      const color = randomColor();
      const chosen = contrastingColor(color);
      const rejected = chosen === 0xffffff ? 0x000000 : 0xffffff;

      expect(ratio(color, chosen)).toBeGreaterThanOrEqual(ratio(color, rejected));
    }
  });

  it("clears the 4.5:1 threshold on the colors the game can generate", () => {
    let worst = Infinity;

    for (let i = 0; i < 500; i++) {
      const color = randomColor();
      const l = luminance(color);
      const contrast = contrastingColor(color) === 0xffffff ? 1.05 / (l + 0.05) : (l + 0.05) / 0.05;

      worst = Math.min(worst, contrast);
    }

    expect(worst).toBeGreaterThanOrEqual(4.5);
  });

  // The two tests above sample at random and are sensitive enough to catch the pivot being off
  // by 0.001. What they cannot do is say where the boundary sits, or fail the same way twice —
  // randomColor is unseeded, so a regression surfaces as some unnamed color. Walking the greys
  // names the exact shade that moved. It is the coarsest of the three, since one grey step is
  // about 0.003 of luminance, and is here for the reproducibility rather than the reach.
  it("flips from white to black exactly at the contrast threshold", () => {
    // Where 1.05/(L+0.05) and (L+0.05)/0.05 meet.
    const pivot = Math.sqrt(1.05 * 0.05) - 0.05;
    const greys = Array.from({ length: 256 }, (_, v) => (v << 16) | (v << 8) | v);

    const flip = greys.findIndex((color) => contrastingColor(color) === 0x000000);

    expect(flip).toBe(greys.findIndex((color) => luminance(color) > pivot));
    expect(contrastingColor(greys[flip - 1])).toBe(0xffffff);
    expect(contrastingColor(greys[flip])).toBe(0x000000);
  });
});

describe("mixColors", () => {
  it("averages each channel independently", () => {
    expect(mixColors(0x000000, 0xffffff)).toBe(0x808080);
    expect(mixColors(0x0a1400, 0x141e00)).toBe(0x0f1900);
  });

  it("leaves a color mixed with itself untouched", () => {
    for (let i = 0; i < 100; i++) {
      const color = randomColor();

      expect(mixColors(color, color)).toBe(color);
    }
  });

  it("does not depend on the order of its arguments", () => {
    for (let i = 0; i < 100; i++) {
      const [a, b] = [randomColor(), randomColor()];

      expect(mixColors(a, b)).toBe(mixColors(b, a));
    }
  });

  it("stays inside the channel range and between the two inputs", () => {
    for (let i = 0; i < 500; i++) {
      const [a, b] = [randomColor(), randomColor()];
      const mixed = colorToIntArray(mixColors(a, b));

      colorToIntArray(a).forEach((low, channel) => {
        const [min, max] = [low, colorToIntArray(b)[channel]].sort((x, y) => x - y);

        expect(Number.isInteger(mixed[channel])).toBe(true);
        expect(mixed[channel]).toBeGreaterThanOrEqual(min);
        expect(mixed[channel]).toBeLessThanOrEqual(max);
      });
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

describe("describeColor", () => {
  it("names each channel with its value", () => {
    expect(describeColor(0x0a141e)).toBe("red 10, green 20, blue 30");
    expect(describeColor(0x000000)).toBe("red 0, green 0, blue 0");
    expect(describeColor(0xffffff)).toBe("red 255, green 255, blue 255");
  });

  it("reports the same channels colorToIntArray unpacks", () => {
    for (let i = 0; i < 100; i++) {
      const color = randomColor();

      expect(describeColor(color)).toBe(
        colorToIntArray(color)
          .map((value, channel) => `${["red", "green", "blue"][channel]} ${value}`)
          .join(", "),
      );
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
