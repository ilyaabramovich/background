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
