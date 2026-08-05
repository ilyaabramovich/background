export const GAME_CONFIG = {
  offsetMultiplier: 20,
  board: {
    columns: 3,
    rows: 3,
  },
};

// Derived rather than written out, so the props that carry these around cannot drift from the
// values themselves. Left off `as const`: readonly would spread into every prop type below for
// nothing, since none of them mutate what they are handed.
export type GameConfig = typeof GAME_CONFIG;
export type BoardLayout = typeof GAME_CONFIG.board;

export const MAX_MOVES = GAME_CONFIG.board.columns * GAME_CONFIG.board.rows - 2;

// What the board says once it is over. Kept as values rather than written into the JSX, because
// the e2e specs find the result by its text: sharing the strings is what stops a reworded
// outcome from quietly leaving the test that looks for it matching nothing. `as const` here, so
// the two spellings become a type narrow enough for GameBoard to promise it renders one of them.
export const GAME_STATUS = {
  won: "You won yay!",
  lost: "Not this time",
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];
