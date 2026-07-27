export function getGameStatus(moves, maxMoves, currentColor, targetColor) {
  if (moves.length < maxMoves) {
    return "playing";
  }

  return colorsEqual(currentColor, targetColor) ? "won" : "lost";
}

export function initializeColors(maxMoves, offsetMultiplier) {
  const initialColor = randomColor();

  return {
    initialColor,
    targetColor: offsetColor(initialColor, generateOffsets(maxMoves), offsetMultiplier),
  };
}

export function offsetColor(color, offsets, offsetMultiplier) {
  return color.map((channel, idx) => wrapChannel(channel + offsets[idx] * offsetMultiplier));
}

function wrapChannel(value) {
  return ((value % 256) + 256) % 256;
}

export function channelOffset(channel, delta) {
  const offsets = [0, 0, 0];
  offsets[channel] = delta;
  return offsets;
}

export function colorsEqual(a, b) {
  return a != null && b != null && a.every((channel, idx) => channel === b[idx]);
}

export function formatColor(color) {
  if (color == null) {
    return undefined;
  }

  return `#${color.map(formatColorComponent).join("")}`;
}

function formatColorComponent(component) {
  return component.toString(16).padStart(2, "0");
}

function randomColor() {
  return Array.from({ length: 3 }, () => Math.floor(Math.random() * 256));
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
