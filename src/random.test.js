import { describe, expect, it } from "vitest";
import { createRandomInt } from "./random";

const draw = (randomInt, count, max) => Array.from({ length: count }, () => randomInt(max));

describe("createRandomInt", () => {
  it("replays the same sequence for the same seed", () => {
    expect(draw(createRandomInt(42), 20, 1000)).toEqual(draw(createRandomInt(42), 20, 1000));
  });

  it("stays inside the inclusive bounds it is asked for", () => {
    const randomInt = createRandomInt(7);

    for (const max of [0, 1, 6, 255, 16777215]) {
      for (const value of draw(randomInt, 200, max)) {
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(max);
      }
    }
  });

  // Days hand over seeds one apart. Without the finalizer in random.js, generators started from
  // neighbouring integers can open with the same few values and consecutive puzzles rhyme.
  it("keeps consecutive seeds from opening alike", () => {
    const openings = new Set(
      Array.from({ length: 500 }, (_, seed) => draw(createRandomInt(seed + 1), 4, 255).join(",")),
    );

    expect(openings.size).toBe(500);
  });

  it("picks its own seed when none is given", () => {
    const sequences = new Set(
      Array.from({ length: 50 }, () => draw(createRandomInt(), 4, 16777215).join(",")),
    );

    expect(sequences.size).toBeGreaterThan(45);
  });
});
