import { formatRgb } from "../utils";

export default function ColorDebug({ color, targetColor }) {
  return <p className="color-debug">{`${formatRgb(color)} ${formatRgb(targetColor)}`}</p>;
}
