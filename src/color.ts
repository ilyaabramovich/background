import type { RandomInt } from "./random";

import { createRandomInt, defaultRandomInt } from "./random";

export type Channel = 0 | 1 | 2;

export const CHANNELS = [
  { channel: 0, name: "red" },
  { channel: 1, name: "green" },
  { channel: 2, name: "blue" },
] as const satisfies readonly { channel: Channel; name: string }[];

export const MAX_CHANNEL = 0xff;

const COLOR_COUNT = 16777216;
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

function clampChannel(value: number) {
  return value < 0 ? 0 : value > MAX_CHANNEL ? MAX_CHANNEL : value;
}

export class Color {
  readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  static random(source: number | RandomInt = defaultRandomInt): Color {
    const randomInt = typeof source === "number" ? createRandomInt(source) : source;

    return new Color(randomInt(COLOR_COUNT - 1));
  }

  static pack([red, green, blue]: number[]): Color {
    return new Color((red << 16) | (green << 8) | blue);
  }

  valueOf(): number {
    return this.value;
  }

  toString(): string {
    return `#${HEX[this.red()]}${HEX[this.green()]}${HEX[this.blue()]}`;
  }

  equals(other: Color): boolean {
    return this.value === other.value;
  }

  channelAt(channel: Channel): number {
    return (this.value >> SHIFTS[channel]) & MAX_CHANNEL;
  }

  red(): number {
    return this.channelAt(0);
  }

  green(): number {
    return this.channelAt(1);
  }

  blue(): number {
    return this.channelAt(2);
  }

  channels(): [number, number, number] {
    return [this.red(), this.green(), this.blue()];
  }

  offsetChannel(channel: Channel, amount: number): Color {
    const shift = SHIFTS[channel];
    const value = clampChannel(this.channelAt(channel) + amount);

    return new Color((this.value & ~(MAX_CHANNEL << shift)) | (value << shift));
  }

  offset(offsets: number[]): Color {
    return CHANNELS.reduce<Color>(
      (color, { channel }) => color.offsetChannel(channel, offsets[channel]),
      this,
    );
  }

  mix(other: Color): Color {
    return new Color((this.value | other.value) - (((this.value ^ other.value) & 0xfefefe) >> 1));
  }

  relativeLuminance(): number {
    return (
      0.2126 * LINEAR_CHANNEL[this.red()] +
      0.7152 * LINEAR_CHANNEL[this.green()] +
      0.0722 * LINEAR_CHANNEL[this.blue()]
    );
  }

  contrasting(): Color {
    return this.relativeLuminance() > CONTRAST_PIVOT ? BLACK : WHITE;
  }

  describe(): string {
    return CHANNELS.map(({ channel, name }) => `${name} ${this.channelAt(channel)}`).join(", ");
  }
}

export const BLACK = new Color(0x000000);
export const WHITE = new Color(0xffffff);
