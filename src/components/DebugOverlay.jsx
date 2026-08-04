import { colorToIntArray } from "../utils";

export default function DebugOverlay({ colors }) {
  return (
    <div
      className="pointer-events-none fixed top-1 right-1 z-10 flex flex-col gap-2 text-xs"
      style={{
        fontFamily: "ui-monospace, monospace",
        whiteSpace: "pre",
        color: "#444",
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
