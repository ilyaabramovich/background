// A whole color packed into one integer, 0xRRGGBB. Named because a bare number in this file is
// just as often a single channel, an offset or a step, and nothing but the name separates them.
export type Color = number;

// Which channel of a packed color, by position. Narrow on purpose: a Color is not assignable to
// it, so offsetChannel's first two arguments can no longer be swapped without a compile error,
// which is the one mistake in here that produces a plausible wrong color rather than a crash.
export type Channel = 0 | 1 | 2;

// The channels in packed order, each paired with what it is called. One list, because the name
// is read out three ways — the control pad's labels, the description below, and the specs that
// drive the game by those labels — and a channel renamed in only some of them is a game whose
// buttons and screen reader disagree.
//
// Pairing each name with its index rather than keeping two lists side by side is what makes
// iterating this yield a Channel: the index .map hands a callback is a plain number, so a bare
// names array would need an assertion to narrow, and nothing but a comment would tie the two.
export const CHANNELS = [
  { channel: 0, name: "red" },
  { channel: 1, name: "green" },
  { channel: 2, name: "blue" },
] as const satisfies readonly { channel: Channel; name: string }[];

export const MAX_CHANNEL = 0xff;

// Black and white text land on equal contrast ratios where 1.05/(L+0.05) meets
// (L+0.05)/0.05, so that luminance (~0.1791) is where the better choice flips. Rounding
// this constant misfiles the colors sitting in the thin band around it.
const CONTRAST_PIVOT = Math.sqrt(1.05 * 0.05) - 0.05;

function clampChannel(value: number) {
  return Math.min(Math.max(value, 0), MAX_CHANNEL);
}

// Takes an array rather than a 3-tuple on purpose: every caller builds its argument with .map,
// which does not carry length through, so a tuple here would only buy assertions at the call
// sites — in the code a seed has to reproduce exactly, which is the last place to put one.
export function packColor([r, g, b]: number[]): Color {
  return (r << 16) | (g << 8) | b;
}

export function offsetColor(colorInt: Color, offsets: number[]): Color {
  return packColor(colorToIntArray(colorInt).map((value, i) => clampChannel(value + offsets[i])));
}

export function offsetChannel(colorInt: Color, channelIndex: Channel, amount: number): Color {
  const channels = colorToIntArray(colorInt);
  channels[channelIndex] = clampChannel(channels[channelIndex] + amount);

  return packColor(channels);
}

// A CSS gradient with no interpolation hint blends in sRGB, so a plain per-channel average
// is exactly the color sitting at the gradient's midpoint, not an approximation of it.
export function mixColors(colorInt: Color, otherColorInt: Color): Color {
  const other = colorToIntArray(otherColorInt);

  return packColor(colorToIntArray(colorInt).map((value, i) => Math.round((value + other[i]) / 2)));
}

// WCAG relative luminance: channels are linearized out of sRGB before being weighted,
// because the eye is far more sensitive to green than to blue.
function relativeLuminance(colorInt: Color) {
  const [r, g, b] = colorToIntArray(colorInt).map((value) => {
    const channel = value / MAX_CHANNEL;

    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastingColor(colorInt: Color): Color {
  return relativeLuminance(colorInt) > CONTRAST_PIVOT ? 0x000000 : 0xffffff;
}

export function formatColor(colorInt: Color): string {
  return `#${colorInt.toString(16).padStart(6, "0")}`;
}

export function describeColor(colorInt: Color): string {
  const channels = colorToIntArray(colorInt);

  return CHANNELS.map(({ channel, name }) => `${name} ${channels[channel]}`).join(", ");
}

export function colorToIntArray(colorInt: Color): [number, number, number] {
  return [
    (colorInt >> 16) & 0xff, // Red
    (colorInt >> 8) & 0xff, // Green
    colorInt & 0xff, // Blue
  ];
}
