import { formatColor } from "../color";
import type { Color } from "../color";

export default function Tile({ color }: { color: Color | null }) {
  return (
    <div
      role="img"
      aria-label={color == null ? "Empty tile" : formatColor(color)}
      aria-roledescription="tile"
      style={{ backgroundColor: color == null ? undefined : formatColor(color) }}
    />
  );
}
