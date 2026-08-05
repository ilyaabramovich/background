import { formatColor } from "../color";
import type { Color } from "../color";

// A null color is a move not yet played, which leaves the tile transparent.
export default function Tile({ color }: { color: Color | null }) {
  return <div style={{ backgroundColor: color == null ? undefined : formatColor(color) }} />;
}
