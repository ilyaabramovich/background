// What the board says once it is over. Kept as values rather than written into the JSX, because
// the e2e specs find the result by its text: sharing the strings is what stops a reworded outcome
// from quietly leaving the test that looks for it matching nothing. `as const`, so the two
// spellings become a type narrow enough for GameBoard to promise it renders one of them.
//
// Its own module rather than config's, which holds the numbers a board is built from. This is the
// game's copy, and it lives apart from the components only because the e2e specs have to read it
// without pulling React into Playwright's process.
export const GAME_STATUS = {
  won: "You won yay!",
  lost: "Not this time",
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];
