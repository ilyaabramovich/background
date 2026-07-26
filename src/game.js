import { offsetColor, randomColor } from "./utils";

export function initializeGameState(maxMoves, offsetMultiplier) {
  const initialColor = randomColor();
  const targetColor = offsetColor(initialColor, generateOffsets(maxMoves), offsetMultiplier);

  return {
    initialColor,
    moves: [],
    targetColor,
  };
}

export function generateOffsets(n) {
  const p1 = Math.floor(Math.random() * (n + 1));
  const p2 = Math.floor(Math.random() * (n + 1));

  const [min, max] = [p1, p2].sort((a, b) => a - b);

  const absX = min;
  const absY = max - min;
  const absZ = n - max;

  const signX = Math.random() < 0.5 ? 1 : -1;
  const signY = Math.random() < 0.5 ? 1 : -1;
  const signZ = Math.random() < 0.5 ? 1 : -1;

  const x = absX * signX;
  const y = absY * signY;
  const z = absZ * signZ;

  return [x, y, z];
}
