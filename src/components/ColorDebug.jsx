import { colorToIntArray } from "../utils";

export default function ColorDebug({ color }) {
  // Right-aligned so the two readouts line up channel-for-channel when compared.
  return (
    <span>
      {colorToIntArray(color)
        .map((v) => String(v).padStart(3))
        .join(" ")}
    </span>
  );
}
