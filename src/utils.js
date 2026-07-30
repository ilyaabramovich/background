const MAX_RGB_COLORS = 16777216;

export function offsetColor(colorInt, [rOffset, gOffset, bOffset]) {
  const r = (colorInt >> 16) & 0xff;
  const g = (colorInt >> 8) & 0xff;
  const b = colorInt & 0xff;

  const newR = (r + rOffset) & 0xff;
  const newG = (g + gOffset) & 0xff;
  const newB = (b + bOffset) & 0xff;

  return (newR << 16) | (newG << 8) | newB;
}

export function offsetChannel(colorInt, channelIndex, amount) {
  const r = (colorInt >> 16) & 0xff;
  const g = (colorInt >> 8) & 0xff;
  const b = colorInt & 0xff;

  if (channelIndex === 0) {
    return (((r + amount) & 0xff) << 16) | (g << 8) | b;
  } else if (channelIndex === 1) {
    return (r << 16) | (((g + amount) & 0xff) << 8) | b;
  } else {
    return (r << 16) | (g << 8) | ((b + amount) & 0xff);
  }
}

export function formatColor(colorInt) {
  return `#${colorInt.toString(16).padStart(6, "0")}`;
}

export function randomColor() {
  return Math.floor(Math.random() * MAX_RGB_COLORS);
}

export function colorToIntArray(colorInt) {
  return [
    (colorInt >> 16) & 0xff, // Red
    (colorInt >> 8) & 0xff, // Green
    colorInt & 0xff, // Blue
  ];
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
