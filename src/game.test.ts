import { describe, expect, it } from "vitest";

import { MAX_MOVES, STEP } from "./config";
import { Game } from "./game";
import { dailySeed } from "./puzzle";

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

// The id is fresh per game, so boards are compared on their colors alone.
const board = (game: Game) => [game.initialColor.value, game.targetColor.value];

describe("Game", () => {
  it("still builds the boards it shipped with", () => {
    const rebuilt = SHIPPED_BOARDS.map(([seed]) => [seed, ...board(new Game("daily", seed))]);

    expect(rebuilt).toEqual(SHIPPED_BOARDS);
  });

  it("gives the same board every time for one seed", () => {
    for (const seed of [20670, 0, 25000]) {
      expect(board(new Game("daily", seed))).toEqual(board(new Game("daily", seed)));
    }
  });

  it("gives different boards to neighbouring days", () => {
    const boards = new Set(
      Array.from({ length: 365 }, (_, day) =>
        String(board(new Game("daily", dailySeed(new Date(2026, 0, 1 + day))))),
      ),
    );

    expect(boards.size).toBe(365);
  });

  it("draws a fresh board when no seed is given", () => {
    const boards = new Set(Array.from({ length: 50 }, () => String(board(new Game("free")))));

    expect(boards.size).toBeGreaterThan(45);
  });

  it("never hands a day a target it cannot reach", () => {
    const unreachable = [];

    for (let day = 0; day < 2000; day++) {
      const date = new Date(2026, 0, 1 + day);
      const { initialColor, targetColor } = new Game("daily", dailySeed(date));
      const from = initialColor.channels();
      const to = targetColor.channels();
      const distance = from.reduce((sum, value, i) => sum + Math.abs(to[i] - value), 0);

      if (distance !== MAX_MOVES * STEP) {
        unreachable.push({ date, initialColor, targetColor, distance });
      }
    }

    expect(unreachable).toEqual([]);
  });

  it("seeds the daily from today and leaves free play unseeded", () => {
    expect(new Game("daily").seed).toBe(dailySeed(new Date()));
    expect(new Game("free").seed).toBeUndefined();
  });

  it("replays a mode from an explicit seed", () => {
    expect(board(new Game("free", 20670))).toEqual(board(new Game("daily", 20670)));
  });

  it("gives every game its own id", () => {
    const ids = new Set(Array.from({ length: 50 }, () => new Game("daily").id));

    expect(ids.size).toBe(50);
  });
});
