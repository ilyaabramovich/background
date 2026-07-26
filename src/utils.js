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
  return a != null && b != null && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

export function formatRgb([r, g, b]) {
  return `(${String(r).padStart(3, " ")}, ${String(g).padStart(3, " ")}, ${String(b).padStart(3, " ")})`;
}

export function formatColor(color) {
  if (color == null) {
    return undefined;
  }

  return `#${formatColorComponent(color[0])}${formatColorComponent(color[1])}${formatColorComponent(color[2])}`;
}

function formatColorComponent(component) {
  return component.toString(16).padStart(2, "0");
}

function randomColor() {
  return [0, 0, 0].map(() => Math.floor(Math.random() * 256));
}

function initializeColors(size) {
  const colors = new Array(size).fill(null);
  colors[0] = randomColor();
  return colors;
}

export function initializeGameState(tileCount, offsetMultiplier) {
  const colorTiles = initializeColors(tileCount);
  const targetColor = offsetColor(colorTiles[0], generateOffsets(tileCount - 1), offsetMultiplier);

  return {
    colorTiles,
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
