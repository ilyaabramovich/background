import { GAME_CONFIG, MAX_MOVES } from "./config";
import { createRandomInt } from "./random";
import { generateOffsets, offsetColor, randomColor } from "./utils";

const DATE_LABEL = new Map();
const MS_PER_DAY = 86400000;

// One board, built from one generator. Everything a seed decides happens in here, which is what
// lets the golden test in puzzle.test.js exercise the same path the app takes.
export function createPuzzle(seed) {
  const randomInt = createRandomInt(seed);
  const initialColor = randomColor(randomInt);
  const offsets = generateOffsets(MAX_MOVES, initialColor, GAME_CONFIG.offsetMultiplier, randomInt);

  return {
    initialColor,
    targetColor: offsetColor(initialColor, offsets),
  };
}

// The seed is the day number: how many days the calendar date sits from 1970-01-01. Consecutive
// days are always exactly one apart, with no jump across a month or year and no value in the
// range that no date can produce. The local year, month and day are read off the date and fed to
// Date.UTC, which lands on an exact multiple of a day whatever the player's zone is doing, so the
// division is never fractional and the board still turns over at their own midnight.
export function dailySeed(date = new Date()) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY;
}

// Formatters are expensive to build, so each locale gets one. Leaving locale undefined lets a
// player see the date the way their own system writes it. The year is left off: it costs the
// actions row enough width to wrap the buttons, and a board you are playing today does not need
// one to be clear.
export function formatPuzzleDate(date, locale) {
  if (!DATE_LABEL.has(locale)) {
    DATE_LABEL.set(locale, new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }));
  }

  return DATE_LABEL.get(locale).format(date);
}
