export const GAME_CONFIG = {
  offsetMultiplier: 10,
  board: {
    columns: 3,
    rows: 3,
    targetPosition: {
      row: 3,
      column: 3,
    },
  },
};

export const CHANNELS = ["red", "green", "blue"];

export function tileCount(board) {
  return board.columns * board.rows - 1;
}

export function maxMoves(board) {
  return tileCount(board) - 1;
}
