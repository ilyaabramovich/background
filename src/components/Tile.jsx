import { formatColor } from "../utils";

export default function Tile({ color }) {
  return <div style={{ backgroundColor: color == null ? undefined : formatColor(color) }} />;
}
