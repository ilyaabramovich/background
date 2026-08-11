export type Color = number;

export type Channel = 0 | 1 | 2;

export const CHANNELS = [
  { channel: 0, name: "red" },
  { channel: 1, name: "green" },
  { channel: 2, name: "blue" },
] as const satisfies readonly { channel: Channel; name: string }[];

export const MAX_CHANNEL = 0xff;

const CONTRAST_PIVOT = Math.sqrt(1.05 * 0.05) - 0.05;

function clampChannel(value: number) {
  return Math.min(Math.max(value, 0), MAX_CHANNEL);
}

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

export function mixColors(colorInt: Color, otherColorInt: Color): Color {
  const other = colorToIntArray(otherColorInt);

  return packColor(colorToIntArray(colorInt).map((value, i) => Math.round((value + other[i]) / 2)));
}

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
