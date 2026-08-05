// Its own module rather than config's, which holds the numbers a board is built from. This is the
// game's copy, and it lives apart from the components only because the e2e specs have to read it
// without pulling React into Playwright's process.
export const GAME_STATUS = {
  won: "You won yay!",
  lost: "Not this time",
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];
