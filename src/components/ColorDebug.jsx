import { formatRgb } from "../utils";

export default function ColorDebug({ color, targetColor }) {
  return (
    <p className="font-mono whitespace-pre tabular-nums text-[#444]">
      {`${formatRgb(color)} ${formatRgb(targetColor)}`}
    </p>
  );
}
