import { describe, expect, it } from "vitest";

import { BLACK, CHANNELS, Color, WHITE } from "./color";

const randomColor = () => new Color(Math.floor(Math.random() * 0x1000000));

const luminance = (color: Color) =>
  color
    .channels()
    .map((value) => {
      const c = value / 255;

      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, c, i) => sum + [0.2126, 0.7152, 0.0722][i] * c, 0);

const ratio = (a: Color, b: Color) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (hi + 0.05) / (lo + 0.05);
};

describe("Color", () => {
  it("keeps the packed value it was built from", () => {
    expect(new Color(0x0a141e).value).toBe(0x0a141e);
    expect(+new Color(0x0a141e)).toBe(0x0a141e);
  });

  it("packs a channel triple back into a color", () => {
    expect(Color.pack([10, 20, 30]).value).toBe(0x0a141e);
    expect(Color.pack([255, 255, 255]).value).toBe(0xffffff);
  });

  it("compares by value rather than by identity", () => {
    expect(new Color(0x0a141e).equals(new Color(0x0a141e))).toBe(true);
    expect(new Color(0x0a141e).equals(new Color(0x0a141f))).toBe(false);
  });
});

describe("Color.random", () => {
  it("produces integers inside the 24-bit color space", () => {
    for (let i = 0; i < 500; i++) {
      const color = Color.random();

      expect(Number.isInteger(color.value)).toBe(true);
      expect(color.value).toBeGreaterThanOrEqual(0);
      expect(color.value).toBeLessThanOrEqual(0xffffff);
    }
  });

  it("draws from the random source it is given", () => {
    expect(Color.random(() => 0x0a141e).value).toBe(0x0a141e);
  });

  it("gives one seed the same color every time", () => {
    for (const seed of [0, 20670, 25000]) {
      expect(Color.random(seed).value).toBe(Color.random(seed).value);
    }
  });

  it("gives different seeds different colors", () => {
    const colors = new Set(Array.from({ length: 200 }, (_, seed) => Color.random(seed).value));

    expect(colors.size).toBeGreaterThan(195);
  });

  it("seeds land in the 24-bit color space", () => {
    for (let seed = 0; seed < 500; seed++) {
      const color = Color.random(seed);

      expect(Number.isInteger(color.value)).toBe(true);
      expect(color.value).toBeGreaterThanOrEqual(0);
      expect(color.value).toBeLessThanOrEqual(0xffffff);
    }
  });
});

describe("offset", () => {
  it("applies each offset to its own channel", () => {
    expect(new Color(0x646464).offset([10, -10, 0]).value).toBe(0x6e5a64);
  });

  it("returns the color unchanged for zero offsets", () => {
    expect(new Color(0x0c2238).offset([0, 0, 0]).value).toBe(0x0c2238);
  });

  it("clamps at zero instead of going negative", () => {
    expect(new Color(0x000a0a).offset([-24, 0, 0]).value).toBe(0x000a0a);
  });

  it("clamps at 255", () => {
    expect(new Color(0xfa0000).offset([10, 0, 0]).value).toBe(0xff0000);
  });

  it("does not bleed a clamped channel into its neighbours", () => {
    expect(new Color(0x00ff00).offset([0, 1, 0]).value).toBe(0x00ff00);
    expect(new Color(0x00ff00).offset([0, -256, 0]).value).toBe(0x000000);
  });

  it("stays in 0-255 across the whole config space", () => {
    const invalid = [];

    for (let channel = 0; channel < 256; channel++) {
      const color = new Color((channel << 16) | (channel << 8) | channel);

      for (let offset = -50; offset <= 50; offset++) {
        for (const multiplier of [1, 5, 10, 20, 40]) {
          const amount = offset * multiplier;
          const result = color.offset([amount, 0, -amount]).channels();

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
    expect(new Color(0x646464).offsetChannel(0, 10).value).toBe(0x6e6464);
    expect(new Color(0x646464).offsetChannel(1, 10).value).toBe(0x646e64);
    expect(new Color(0x646464).offsetChannel(2, 10).value).toBe(0x64646e);
  });

  it("clamps within the channel without bleeding into its neighbours", () => {
    expect(new Color(0x00ff00).offsetChannel(1, 1).value).toBe(0x00ff00);
    expect(new Color(0xff00ff).offsetChannel(1, -1).value).toBe(0xff00ff);
  });

  it("agrees with offset for every channel", () => {
    const color = new Color(0x123456);

    for (const { channel } of CHANNELS) {
      for (const amount of [-40, -10, 0, 10, 40]) {
        const offsets = [0, 0, 0];
        offsets[channel] = amount;

        expect(color.offsetChannel(channel, amount).value).toBe(color.offset(offsets).value);
      }
    }
  });
});

describe("contrasting", () => {
  it("returns white on dark colors and black on light ones", () => {
    expect(new Color(0x000000).contrasting().value).toBe(0xffffff);
    expect(new Color(0xffffff).contrasting().value).toBe(0x000000);
    expect(new Color(0x0000ff).contrasting().value).toBe(0xffffff);
    expect(new Color(0x00ff00).contrasting().value).toBe(0x000000);
  });

  it("always picks whichever of black or white contrasts more", () => {
    for (let i = 0; i < 500; i++) {
      const color = randomColor();
      const chosen = color.contrasting();
      const rejected = chosen.equals(WHITE) ? BLACK : WHITE;

      expect(ratio(color, chosen)).toBeGreaterThanOrEqual(ratio(color, rejected));
    }
  });

  it("clears the 4.5:1 threshold on the colors the game can generate", () => {
    let worst = Infinity;

    for (let i = 0; i < 500; i++) {
      const color = randomColor();
      const l = luminance(color);
      const contrast = color.contrasting().equals(WHITE) ? 1.05 / (l + 0.05) : (l + 0.05) / 0.05;

      worst = Math.min(worst, contrast);
    }

    expect(worst).toBeGreaterThanOrEqual(4.5);
  });

  it("flips from white to black exactly at the contrast threshold", () => {
    const pivot = Math.sqrt(1.05 * 0.05) - 0.05;
    const greys = Array.from({ length: 256 }, (_, v) => new Color((v << 16) | (v << 8) | v));

    const flip = greys.findIndex((color) => color.contrasting().equals(BLACK));

    expect(flip).toBe(greys.findIndex((color) => luminance(color) > pivot));
    expect(greys[flip - 1].contrasting().equals(WHITE)).toBe(true);
    expect(greys[flip].contrasting().equals(BLACK)).toBe(true);
  });
});

describe("mix", () => {
  it("averages each channel independently", () => {
    expect(new Color(0x000000).mix(new Color(0xffffff)).value).toBe(0x808080);
    expect(new Color(0x0a1400).mix(new Color(0x141e00)).value).toBe(0x0f1900);
  });

  it("leaves a color mixed with itself untouched", () => {
    for (let i = 0; i < 100; i++) {
      const color = randomColor();

      expect(color.mix(color).value).toBe(color.value);
    }
  });

  it("does not depend on the order of its arguments", () => {
    for (let i = 0; i < 100; i++) {
      const [a, b] = [randomColor(), randomColor()];

      expect(a.mix(b).value).toBe(b.mix(a).value);
    }
  });

  it("stays inside the channel range and between the two inputs", () => {
    for (let i = 0; i < 500; i++) {
      const [a, b] = [randomColor(), randomColor()];
      const mixed = a.mix(b).channels();

      a.channels().forEach((low, channel) => {
        const [min, max] = [low, b.channels()[channel]].sort((x, y) => x - y);

        expect(Number.isInteger(mixed[channel])).toBe(true);
        expect(mixed[channel]).toBeGreaterThanOrEqual(min);
        expect(mixed[channel]).toBeLessThanOrEqual(max);
      });
    }
  });
});

describe("toString", () => {
  it("zero-pads to six digits", () => {
    expect(new Color(0x000000).toString()).toBe("#000000");
    expect(new Color(0x000522).toString()).toBe("#000522");
  });

  it("formats full-range channels", () => {
    expect(new Color(0xffffff).toString()).toBe("#ffffff");
  });

  it("renders the hex when interpolated into a string", () => {
    expect(`${new Color(0x000522)}`).toBe("#000522");
  });

  it("round-trips back to the original channels", () => {
    for (let i = 0; i < 100; i++) {
      const color = randomColor();
      const hex = color.toString();

      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
      expect([
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
      ]).toEqual(color.channels());
    }
  });
});

describe("describe", () => {
  it("names each channel with its value", () => {
    expect(new Color(0x0a141e).describe()).toBe("red 10, green 20, blue 30");
    expect(new Color(0x000000).describe()).toBe("red 0, green 0, blue 0");
    expect(new Color(0xffffff).describe()).toBe("red 255, green 255, blue 255");
  });

  it("reports the same channels channels() unpacks", () => {
    for (let i = 0; i < 100; i++) {
      const color = randomColor();

      expect(color.describe()).toBe(
        color
          .channels()
          .map((value, channel) => `${["red", "green", "blue"][channel]} ${value}`)
          .join(", "),
      );
    }
  });
});

describe("channels", () => {
  it("unpacks the channels in red, green, blue order", () => {
    expect(new Color(0x0a141e).channels()).toEqual([10, 20, 30]);
    expect(new Color(0x000000).channels()).toEqual([0, 0, 0]);
    expect(new Color(0xffffff).channels()).toEqual([255, 255, 255]);
  });

  it("agrees with the per-channel accessors", () => {
    const color = new Color(0x0a141e);

    expect([color.red(), color.green(), color.blue()]).toEqual(color.channels());
    expect(CHANNELS.map(({ channel }) => color.channelAt(channel))).toEqual(color.channels());
  });
});
