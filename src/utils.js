const MAX_RGB_COLORS = 16777216;
const MAX_CHANNEL = 0xff;

function clampChannel(value) {
  return Math.min(Math.max(value, 0), MAX_CHANNEL);
}

function packColor([r, g, b]) {
  return (r << 16) | (g << 8) | b;
}

export function offsetColor(colorInt, offsets) {
  return packColor(colorToIntArray(colorInt).map((value, i) => clampChannel(value + offsets[i])));
}

export function offsetChannel(colorInt, channelIndex, amount) {
  const channels = colorToIntArray(colorInt);
  channels[channelIndex] = clampChannel(channels[channelIndex] + amount);

  return packColor(channels);
}

// WCAG relative luminance: channels are linearized out of sRGB before being weighted,
// because the eye is far more sensitive to green than to blue.
function relativeLuminance(colorInt) {
  const [r, g, b] = colorToIntArray(colorInt).map((value) => {
    const channel = value / MAX_CHANNEL;

    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Black and white text land on equal contrast ratios where 1.05/(L+0.05) meets
// (L+0.05)/0.05, so that luminance (~0.1791) is where the better choice flips. Rounding
// this constant misfiles the colors sitting in the thin band around it.
const CONTRAST_PIVOT = Math.sqrt(1.05 * 0.05) - 0.05;

export function contrastingColor(colorInt) {
  return relativeLuminance(colorInt) > CONTRAST_PIVOT ? 0x000000 : 0xffffff;
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

// Now that channels clamp instead of wrapping, an offset that runs past 0 or 255 would
// produce a target no sequence of steps can reach. So the direction is chosen from the
// headroom the channel actually has rather than by coin flip.
function pickDirection(value, distance) {
  const canIncrease = value + distance <= MAX_CHANNEL;
  const canDecrease = value - distance >= 0;

  if (canIncrease && canDecrease) {
    return Math.random() < 0.5 ? 1 : -1;
  }
  if (canIncrease || canDecrease) {
    return canIncrease ? 1 : -1;
  }

  // Only when distance exceeds half the channel range, i.e. the board asks for more moves
  // than a channel can absorb. The target is unreachable either way; take the roomier side.
  return value < MAX_CHANNEL - value ? 1 : -1;
}

export function generateOffsets(moveCount, initialColor, step = 1) {
  const p1 = Math.floor(Math.random() * (moveCount + 1));
  const p2 = Math.floor(Math.random() * (moveCount + 1));

  const [min, max] = [p1, p2].sort((a, b) => a - b);
  const magnitudes = [min, max - min, moveCount - max];
  const channels = colorToIntArray(initialColor);

  return magnitudes.map((magnitude, index) => {
    const distance = magnitude * step;

    return distance * pickDirection(channels[index], distance);
  });
}
