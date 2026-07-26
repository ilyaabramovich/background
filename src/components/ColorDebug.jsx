import { formatRgb } from "../utils";

export default function ColorDebug({ color, targetColor }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: "monospace",
        whiteSpace: "pre",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {`${formatRgb(color)} ${formatRgb(targetColor)}`}
    </p>
  );
}
