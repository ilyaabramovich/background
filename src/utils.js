const MAX_RGB_COLORS = 16777216;
const MAX_CHANNEL = 0xff;

// Every draw goes through an injected randomInt(max) so a board can be rebuilt from a seed; see
// createRandomInt in random.js. Unseeded play falls back to this, and max is inclusive.
const defaultRandomInt = (max) => Math.floor(Math.random() * (max + 1));

// Black and white text land on equal contrast ratios where 1.05/(L+0.05) meets
// (L+0.05)/0.05, so that luminance (~0.1791) is where the better choice flips. Rounding
// this constant misfiles the colors sitting in the thin band around it.
const CONTRAST_PIVOT = Math.sqrt(1.05 * 0.05) - 0.05;

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

// A CSS gradient with no interpolation hint blends in sRGB, so a plain per-channel average
// is exactly the color sitting at the gradient's midpoint, not an approximation of it.
export function mixColors(colorInt, otherColorInt) {
  const other = colorToIntArray(otherColorInt);

  return packColor(colorToIntArray(colorInt).map((value, i) => Math.round((value + other[i]) / 2)));
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

export function contrastingColor(colorInt) {
  return relativeLuminance(colorInt) > CONTRAST_PIVOT ? 0x000000 : 0xffffff;
}

export function formatColor(colorInt) {
  return `#${colorInt.toString(16).padStart(6, "0")}`;
}

// The board says everything through color alone, so the only way to follow a game without
// seeing it is to have the channels spelled out.
export function describeColor(colorInt) {
  const [red, green, blue] = colorToIntArray(colorInt);

  return `red ${red}, green ${green}, blue ${blue}`;
}

export function randomColor(randomInt = defaultRandomInt) {
  return randomInt(MAX_RGB_COLORS - 1);
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
function pickDirection(value, distance, randomInt) {
  const canIncrease = value + distance <= MAX_CHANNEL;
  const canDecrease = value - distance >= 0;

  if (canIncrease && canDecrease) {
    return randomInt(1) === 0 ? 1 : -1;
  }
  if (canIncrease || canDecrease) {
    return canIncrease ? 1 : -1;
  }

  // Only reached when the board asks for more moves than all three channels together can
  // absorb. The target is unreachable either way; take the roomier side.
  return value < MAX_CHANNEL - value ? 1 : -1;
}

// A channel always has at least half the range free on one side, so it can hold this many
// steps no matter which direction pickDirection ends up choosing.
function headroomInMoves(value, step) {
  return Math.floor(Math.max(value, MAX_CHANNEL - value) / step);
}

// The random three-way split above knows nothing about where the channels start, so it can
// hand a channel more steps than it can travel without clamping — and a clamped target is
// one no sequence of moves can reach. Overflow moves are passed to a channel that still has
// room, which keeps the total at moveCount and so keeps the target exactly that far away.
function fitToHeadroom(magnitudes, channels, step) {
  const capacities = channels.map((value) => headroomInMoves(value, step));
  const fitted = [...magnitudes];

  for (let channel = 0; channel < fitted.length; channel++) {
    while (fitted[channel] > capacities[channel]) {
      const spare = fitted.findIndex((moves, i) => i !== channel && moves < capacities[i]);

      // Only when the whole board asks for more than the color space can hold.
      if (spare === -1) break;

      fitted[channel]--;
      fitted[spare]++;
    }
  }

  return fitted;
}

// The order and count of draws below is what a seed reproduces, so changing it renumbers every
// past daily board. src/puzzle.test.js pins the first thirty days against exactly that.
export function generateOffsets(moveCount, initialColor, step = 1, randomInt = defaultRandomInt) {
  const p1 = randomInt(moveCount);
  const p2 = randomInt(moveCount);

  const [min, max] = [p1, p2].sort((a, b) => a - b);
  const channels = colorToIntArray(initialColor);
  const magnitudes = fitToHeadroom([min, max - min, moveCount - max], channels, step);

  return magnitudes.map((magnitude, index) => {
    const distance = magnitude * step;

    return distance * pickDirection(channels[index], distance, randomInt);
  });
}
