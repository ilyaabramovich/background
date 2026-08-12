export type Color = number;

export type Channel = 0 | 1 | 2;

export const CHANNELS = [
  { channel: 0, name: "red" },
  { channel: 1, name: "green" },
  { channel: 2, name: "blue" },
] as const satisfies readonly { channel: Channel; name: string }[];

export const MAX_CHANNEL = 0xff;

const CONTRAST_PIVOT = 0.17912878474779204; // Math.sqrt(1.05 * 0.05) - 0.05;
const SHIFTS = [16, 8, 0] as const satisfies readonly number[];
const LINEAR_CHANNEL = new Float32Array(MAX_CHANNEL + 1);

for (let i = 0; i <= MAX_CHANNEL; i++) {
  const channel = i / MAX_CHANNEL;
  LINEAR_CHANNEL[i] = channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

const HEX = Array.from({ length: MAX_CHANNEL + 1 }, (_, value) =>
  value.toString(16).padStart(2, "0"),
);

function channelAt(colorInt: Color, channel: Channel) {
  return (colorInt >> SHIFTS[channel]) & MAX_CHANNEL;
}

function clampChannel(value: number) {
  return value < 0 ? 0 : value > 255 ? 255 : value;
}

export function packColor([r, g, b]: number[]): Color {
  return (r << 16) | (g << 8) | b;
}

export function offsetColor(colorInt: Color, offsets: number[]): Color {
  let offset = colorInt;

  for (const { channel } of CHANNELS) {
    offset = offsetChannel(offset, channel, offsets[channel]);
  }

  return offset;
}

export function offsetChannel(colorInt: Color, channelIndex: Channel, amount: number): Color {
  const shift = SHIFTS[channelIndex];
  const value = clampChannel(((colorInt >> shift) & MAX_CHANNEL) + amount);

  return (colorInt & ~(MAX_CHANNEL << shift)) | (value << shift);
}

export function mixColors(colorInt: Color, otherColorInt: Color): Color {
  return (colorInt | otherColorInt) - (((colorInt ^ otherColorInt) & 0xfefefe) >> 1);
}

function relativeLuminance(colorInt: Color) {
  return (
    0.2126 * LINEAR_CHANNEL[channelAt(colorInt, 0)] +
    0.7152 * LINEAR_CHANNEL[channelAt(colorInt, 1)] +
    0.0722 * LINEAR_CHANNEL[channelAt(colorInt, 2)]
  );
}

export function contrastingColor(colorInt: Color): Color {
  return relativeLuminance(colorInt) > CONTRAST_PIVOT ? 0x000000 : 0xffffff;
}

export function formatColor(colorInt: Color): string {
  return `#${HEX[channelAt(colorInt, 0)]}${HEX[channelAt(colorInt, 1)]}${HEX[channelAt(colorInt, 2)]}`;
}

export function describeColor(colorInt: Color): string {
  return CHANNELS.map(({ channel, name }) => `${name} ${channelAt(colorInt, channel)}`).join(", ");
}

export function colorToIntArray(colorInt: Color): [number, number, number] {
  return [channelAt(colorInt, 0), channelAt(colorInt, 1), channelAt(colorInt, 2)];
}
