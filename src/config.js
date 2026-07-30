export const GAME_CONFIG = {
  offsetMultiplier: 10,
  board: {
    columns: 3,
    rows: 3,
  },
};

export const MAX_MOVES = GAME_CONFIG.board.columns * GAME_CONFIG.board.rows - 2;
