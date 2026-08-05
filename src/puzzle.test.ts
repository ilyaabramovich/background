import { describe, expect, it } from "vitest";
import { createPuzzle, dailySeed, formatPuzzleDate, generateOffsets, randomColor } from "./puzzle";
import { GAME_CONFIG, MAX_MOVES } from "./config";
import { CHANNELS, colorToIntArray, offsetChannel, offsetColor } from "./color";

// A seed only reproduces a board while the draws behind it stay put: the two cut points in
// generateOffsets, then however many pickDirection takes. Reordering them, changing GAME_CONFIG,
// or a pure-rand upgrade that shifts its output would all quietly rebuild every past daily.
// These are the boards as shipped, keyed by the day number that seeds them. The date each one
// belongs to rides along in a comment, since a day number does not read as one. A diff means
// history moved.
const SHIPPED_BOARDS = [
  [20670, 0x83955f, 0x4795af], // 2026-08-05
  [20671, 0x8f49e3, 0x0349e3], // 2026-08-06
  [20672, 0x631371, 0x4f27d5], // 2026-08-07
  [20673, 0x0e3d3d, 0x22b53d], // 2026-08-08
  [20674, 0x4f16f0, 0x4f3e8c], // 2026-08-09
  [20675, 0x39a060, 0x4d2860], // 2026-08-10
  [20676, 0x521615, 0xb62a29], // 2026-08-11
  [20677, 0x094504, 0x598104], // 2026-08-12
  [20678, 0xe80ae7, 0x841ed3], // 2026-08-13
  [20679, 0x960d8d, 0xbe21dd], // 2026-08-14
  [20680, 0x85033a, 0x211726], // 2026-08-15
  [20681, 0xb71a04, 0x531a2c], // 2026-08-16
  [20682, 0x22b14b, 0x22b1d7], // 2026-08-17
  [20683, 0x6417ca, 0x5067f2], // 2026-08-18
  [20684, 0x38ad50, 0x604950], // 2026-08-19
  [20685, 0xe0b48f, 0xb8647b], // 2026-08-20
  [20686, 0x226bbf, 0x0ebbe7], // 2026-08-21
  [20687, 0x691c15, 0xf51c15], // 2026-08-22
  [20688, 0xbdcebd, 0x59ce95], // 2026-08-23
  [20689, 0x9a63fc, 0x8613d4], // 2026-08-24
  [20690, 0x65b429, 0xc9a015], // 2026-08-25
  [20691, 0xb174dc, 0xb1ecc8], // 2026-08-26
  [20692, 0xe260e9, 0xe28885], // 2026-08-27
  [20693, 0xcfc761, 0x938b75], // 2026-08-28
  [20694, 0xd23cb7, 0x6e14b7], // 2026-08-29
  [20695, 0xe70b38, 0xfb3388], // 2026-08-30
  [20696, 0x400f2f, 0x54377f], // 2026-08-31
  [20697, 0x0accae, 0x467cae], // 2026-09-01
  [20698, 0xb54bad, 0xa1af99], // 2026-09-02
  [20699, 0x2f8207, 0x7f962f], // 2026-09-03
];

describe("createPuzzle", () => {
  it("still builds the boards it shipped with", () => {
    const rebuilt = SHIPPED_BOARDS.map(([seed]) => {
      const { initialColor, targetColor } = createPuzzle(seed);

      return [seed, initialColor, targetColor];
    });

    expect(rebuilt).toEqual(SHIPPED_BOARDS);
  });

  it("gives the same board every time for one seed", () => {
    for (const seed of [20670, 0, 25000]) {
      expect(createPuzzle(seed)).toEqual(createPuzzle(seed));
    }
  });

  it("gives different boards to neighbouring days", () => {
    const boards = new Set(
      Array.from({ length: 365 }, (_, day) =>
        JSON.stringify(createPuzzle(dailySeed(new Date(2026, 0, 1 + day)))),
      ),
    );

    expect(boards.size).toBe(365);
  });

  it("draws a fresh board when no seed is given", () => {
    const boards = new Set(Array.from({ length: 50 }, () => JSON.stringify(createPuzzle())));

    expect(boards.size).toBeGreaterThan(45);
  });

  // The reachability guarantee generateOffsets is held to below has to survive the seeded path
  // too, or a day would be unwinnable for everyone at once rather than for one unlucky player.
  it("never hands a day a target it cannot reach", () => {
    const unreachable = [];

    for (let day = 0; day < 2000; day++) {
      const date = new Date(2026, 0, 1 + day);
      const { initialColor, targetColor } = createPuzzle(dailySeed(date));
      const from = colorToIntArray(initialColor);
      const to = colorToIntArray(targetColor);
      const distance = from.reduce((sum, value, i) => sum + Math.abs(to[i] - value), 0);

      if (distance !== MAX_MOVES * GAME_CONFIG.offsetMultiplier) {
        unreachable.push({ date, initialColor, targetColor, distance });
      }
    }

    expect(unreachable).toEqual([]);
  });
});

describe("dailySeed", () => {
  it("counts whole days from 1970-01-01", () => {
    expect(dailySeed(new Date(1970, 0, 1))).toBe(0);
    expect(dailySeed(new Date(2026, 7, 5))).toBe(20670);
    expect(dailySeed(new Date(2026, 0, 1))).toBe(20454);
    expect(dailySeed(new Date(2026, 11, 31))).toBe(20818);
  });

  // What the day number buys over a packed YYYYMMDD: one step per day everywhere, so month and
  // year boundaries are not special cases and no integer in the range is a date that never was.
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

  // Handing Date.UTC the local calendar fields is what keeps this true: the result is an exact
  // multiple of a day, so the division stays whole. Dividing a local timestamp instead is where a
  // 23- or 25-hour day would land mid-day and cost or repeat a board.
  it("moves on by one whole day across a daylight-saving change", () => {
    // Late March and late October bracket the EU and US clock changes.
    for (const [year, month, start] of [
      [2027, 2, 26],
      [2027, 9, 29],
    ]) {
      for (let day = start; day <= start + 4; day++) {
        const today = dailySeed(new Date(year, month, day, 12, 0));
        const tomorrow = dailySeed(new Date(year, month, day + 1, 12, 0));

        expect(Number.isInteger(today)).toBe(true);
        expect(tomorrow - today).toBe(1);
        expect(createPuzzle(tomorrow)).not.toEqual(createPuzzle(today));
      }
    }
  });
});

describe("formatPuzzleDate", () => {
  it("writes the date the way the given locale does", () => {
    expect(formatPuzzleDate(new Date(2026, 7, 5), "en-GB")).toBe("5 Aug");
    expect(formatPuzzleDate(new Date(2026, 7, 5), "en-US")).toBe("Aug 5");
  });

  it("reuses one formatter per locale", () => {
    const date = new Date(2026, 7, 5);

    expect(formatPuzzleDate(date, "en-GB")).toBe(formatPuzzleDate(date, "en-GB"));
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
    const unreachable: { initialColor: number; channel: number; exact: number }[] = [];

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

      CHANNELS.forEach(({ channel }) => {
        const offset = offsets[channel];

        for (let i = 0; i < Math.abs(offset) / step; i++) {
          color = offsetChannel(color, channel, Math.sign(offset) * step);
          played++;
        }
      });

      expect(color).toBe(target);
      expect(played).toBe(moveCount);
    }
  });

  // Everything above stops at what the three channels can hold. Past that, pickDirection's
  // last return and fitToHeadroom's break are the only code that runs, and they are what
  // decides the shape of a board nothing can solve. The board is unreachable by construction
  // here — 2000 units of travel against roughly 384 of headroom — so the point is not that the
  // magnitudes still add up, which they cannot, but that the split terminates and still hands
  // back three whole offsets rather than looping or going fractional.
  it("still terminates when the board asks for more than the channels can hold", () => {
    for (const initialColor of [0x000000, 0x808080, 0xffffff, 0x0080ff]) {
      const offsets = generateOffsets(100, initialColor, 20);

      expect(offsets).toHaveLength(3);
      for (const offset of offsets) {
        expect(Number.isInteger(offset)).toBe(true);
      }
    }
  });
});
