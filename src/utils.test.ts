import { describe, expect, it } from "vitest";
import { GAME_CONFIG, MAX_MOVES } from "./config";
import {
  colorToIntArray,
  contrastingColor,
  describeColor,
  formatColor,
  generateOffsets,
  mixColors,
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

describe("contrastingColor", () => {
  it("returns white on dark colors and black on light ones", () => {
    expect(contrastingColor(0x000000)).toBe(0xffffff);
    expect(contrastingColor(0xffffff)).toBe(0x000000);
    expect(contrastingColor(0x0000ff)).toBe(0xffffff); // blue reads dark
    expect(contrastingColor(0x00ff00)).toBe(0x000000); // green reads light
  });

  it("always picks whichever of black or white contrasts more", () => {
    // WCAG contrast ratio, recomputed here rather than reusing the implementation.
    const luminance = (colorInt) =>
      colorToIntArray(colorInt)
        .map((value) => {
          const c = value / 255;

          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        })
        .reduce((sum, c, i) => sum + [0.2126, 0.7152, 0.0722][i] * c, 0);

    const ratio = (a, b) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);

      return (hi + 0.05) / (lo + 0.05);
    };

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
      const l = colorToIntArray(color)
        .map((value) => {
          const c = value / 255;

          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        })
        .reduce((sum, c, i) => sum + [0.2126, 0.7152, 0.0722][i] * c, 0);
      const contrast = contrastingColor(color) === 0xffffff ? 1.05 / (l + 0.05) : (l + 0.05) / 0.05;

      worst = Math.min(worst, contrast);
    }

    expect(worst).toBeGreaterThanOrEqual(4.5);
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

  // Every channel keeps at least 128 of headroom on one side or the other, so with three
  // channels a board can place 3 * floor(128 / step) moves and still land inside 0-255.
  it("never places the target past a channel edge", () => {
    const step = 10;

    for (let moveCount = 0; moveCount <= 3 * Math.floor(128 / step); moveCount++) {
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

  // Reads the real board rather than a hand-picked step, so the shipped game can never
  // drift outside what the reachability guarantee above was proven against.
  it("never places the target past a channel edge at the shipped config", () => {
    const unreachable = [];

    for (let draw = 0; draw < 20000; draw++) {
      const initialColor = randomColor();
      const channels = colorToIntArray(initialColor);

      generateOffsets(MAX_MOVES, initialColor, GAME_CONFIG.offsetMultiplier).forEach(
        (offset, channel) => {
          const exact = channels[channel] + offset;

          if (exact < 0 || exact > 255) {
            unreachable.push({ initialColor, channel, exact });
          }
        },
      );
    }

    expect(unreachable).toEqual([]);
  });

  // The three-way split can hand every move to one channel. At the shipped multiplier that
  // is 140 of travel, which a channel sitting near the middle cannot absorb in either
  // direction, so those draws used to produce a target no sequence of moves could reach.
  it("survives every move landing on a single channel", () => {
    // Cut points of (7,7), (0,7) and (0,0) put the whole move budget on one channel. Later
    // draws are pickDirection's, and any value does for those.
    const cutPointsPerChannel = [
      [MAX_MOVES, MAX_MOVES],
      [0, MAX_MOVES],
      [0, 0],
    ];

    cutPointsPerChannel.forEach((cutPoints, loadedChannel) => {
      for (let value = 0; value <= 255; value++) {
        const queue = [...cutPoints];
        const randomInt = () => queue.shift() ?? 0;

        const channels = [0, 0, 0];
        channels[loadedChannel] = value;
        const initialColor = (channels[0] << 16) | (channels[1] << 8) | channels[2];
        const offsets = generateOffsets(
          MAX_MOVES,
          initialColor,
          GAME_CONFIG.offsetMultiplier,
          randomInt,
        );

        expect(offsets.reduce((sum, offset) => sum + Math.abs(offset), 0)).toBe(
          MAX_MOVES * GAME_CONFIG.offsetMultiplier,
        );
        offsets.forEach((offset, channel) => {
          const exact = channels[channel] + offset;

          expect(exact).toBeGreaterThanOrEqual(0);
          expect(exact).toBeLessThanOrEqual(255);
        });
      }
    });
  });

  // The tightest board there is: no channel has more than 128 of headroom on either side.
  it("places a reachable target when every channel starts mid-range", () => {
    for (let draw = 0; draw < 2000; draw++) {
      const initialColor = 0x808080;
      const channels = colorToIntArray(initialColor);

      generateOffsets(MAX_MOVES, initialColor, GAME_CONFIG.offsetMultiplier).forEach(
        (offset, channel) => {
          const exact = channels[channel] + offset;

          expect(exact).toBeGreaterThanOrEqual(0);
          expect(exact).toBeLessThanOrEqual(255);
        },
      );
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
