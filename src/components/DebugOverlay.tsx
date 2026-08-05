import { colorToIntArray } from "../color";
import type { Color } from "../color";

export default function DebugOverlay({ colors }: { colors: Color[] }) {
  return (
    <div
      className="pointer-events-none flex flex-col gap-2 text-xs"
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 10,
        fontFamily: "ui-monospace, monospace",
        whiteSpace: "pre",
      }}
    >
      {colors.map((color, idx) => (
        <span key={idx}>
          {colorToIntArray(color)
            .map((v) => String(v).padStart(3))
            .join(" ")}
        </span>
      ))}
    </div>
  );
}
