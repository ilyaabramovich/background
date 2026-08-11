export const GAME_STATUS = {
  won: "You won yay!",
  lost: "Not this time",
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];
