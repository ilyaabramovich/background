import { describe, expect, it } from "vitest";

import { CHANNELS, Color } from "./color";
import { MAX_MOVES, STEP } from "./config";
import { Game } from "./game";
import { dailySeed, generateOffsets } from "./puzzle";

const randomColor = () => new Color(Math.floor(Math.random() * 0x1000000));

describe("dailySeed", () => {
  it("counts whole days from 1970-01-01", () => {
    expect(dailySeed(new Date(1970, 0, 1))).toBe(0);
    expect(dailySeed(new Date(2026, 7, 5))).toBe(20670);
    expect(dailySeed(new Date(2026, 0, 1))).toBe(20454);
    expect(dailySeed(new Date(2026, 11, 31))).toBe(20818);
  });

  it("steps by exactly one a day, month and year ends included", () => {
    for (let day = 0; day < 800; day++) {
      const today = new Date(2026, 0, 1 + day);
      const tomorrow = new Date(2026, 0, 2 + day);

      expect(dailySeed(tomorrow) - dailySeed(today)).toBe(1);
    }
  });

  it("ignores the clock, so the board turns over at local midnight", () => {
    const hours = [0, 1, 11, 12, 13, 23].map((hour) => dailySeed(new Date(2026, 8, 1, hour, 30)));

    expect(new Set(hours).size).toBe(1);
  });

  it("gives every day of a year its own seed", () => {
    const seeds = new Set(
      Array.from({ length: 366 }, (_, day) => dailySeed(new Date(2028, 0, 1 + day))),
    );

    expect(seeds.size).toBe(366);
  });

  it("moves on by one whole day across a daylight-saving change", () => {
    for (const [year, month, start] of [
      [2027, 2, 26],
      [2027, 9, 29],
    ]) {
      for (let day = start; day <= start + 4; day++) {
        const today = dailySeed(new Date(year, month, day, 12, 0));
        const tomorrow = dailySeed(new Date(year, month, day + 1, 12, 0));

        expect(Number.isInteger(today)).toBe(true);
        expect(tomorrow - today).toBe(1);
        expect(new Game("daily", tomorrow).targetColor.value).not.toBe(
          new Game("daily", today).targetColor.value,
        );
      }
    }
  });
});

function expectReachable(initialColor: Color, offsets: number[]) {
  const channels = initialColor.channels();

  const unreachable = offsets.flatMap((offset, channel) => {
    const exact = channels[channel] + offset;

    return exact < 0 || exact > 255 ? [{ initialColor, channel, exact }] : [];
  });

  expect(unreachable).toEqual([]);
}

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

  it("never places the target past a channel edge", () => {
    const step = 10;

    for (let moveCount = 0; moveCount <= 3 * Math.floor(128 / step); moveCount++) {
      for (let draw = 0; draw < 100; draw++) {
        const initialColor = randomColor();

        expectReachable(initialColor, generateOffsets(moveCount, initialColor, step));
      }
    }
  });

  it("never places the target past a channel edge at the shipped config", () => {
    for (let draw = 0; draw < 20000; draw++) {
      const initialColor = randomColor();

      expectReachable(initialColor, generateOffsets(MAX_MOVES, initialColor, STEP));
    }
  });

  it("survives every move landing on a single channel", () => {
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
        const initialColor = Color.pack(channels);
        const offsets = generateOffsets(MAX_MOVES, initialColor, STEP, randomInt);

        expect(offsets.reduce((sum, offset) => sum + Math.abs(offset), 0)).toBe(MAX_MOVES * STEP);
        expectReachable(initialColor, offsets);
      }
    });
  });

  it("places a reachable target when every channel starts mid-range", () => {
    for (let draw = 0; draw < 2000; draw++) {
      const initialColor = new Color(0x808080);

      expectReachable(initialColor, generateOffsets(MAX_MOVES, initialColor, STEP));
    }
  });

  it("leaves the target reachable in exactly moveCount steps", () => {
    const step = 10;
    const moveCount = 7;

    for (let draw = 0; draw < 200; draw++) {
      const initialColor = randomColor();
      const offsets = generateOffsets(moveCount, initialColor, step);
      const target = initialColor.offset(offsets);

      let color = initialColor;
      let played = 0;

      CHANNELS.forEach(({ channel }) => {
        const offset = offsets[channel];

        for (let i = 0; i < Math.abs(offset) / step; i++) {
          color = color.offsetChannel(channel, Math.sign(offset) * step);
          played++;
        }
      });

      expect(color.value).toBe(target.value);
      expect(played).toBe(moveCount);
    }
  });

  it("still terminates when the board asks for more than the channels can hold", () => {
    for (const initialColor of [0x000000, 0x808080, 0xffffff, 0x0080ff]) {
      const offsets = generateOffsets(100, new Color(initialColor), 20);

      expect(offsets).toHaveLength(3);
      for (const offset of offsets) {
        expect(Number.isInteger(offset)).toBe(true);
      }
    }
  });
});
