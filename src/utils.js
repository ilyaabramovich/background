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

export function randomColor() {
  return Array.from({ length: 3 }, () => Math.floor(Math.random() * 256));
}
