import { formatColor } from "../utils";

export default function ColorTile({ color }) {
  return <div className="aspect-square" style={{ backgroundColor: formatColor(color) }}></div>;
}
