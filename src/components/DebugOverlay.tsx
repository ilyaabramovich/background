import type { Color } from "../color";

export default function DebugOverlay({ colors }: { colors: Color[] }) {
  return (
    <div
      className="pointer-events-none flex flex-col gap-2 text-xs"
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 10,
        fontFamily: "ui-monospace, monospace",
        whiteSpace: "pre",
      }}
    >
      {colors.map((color, idx) => (
        <span key={idx}>
          {color
            .channels()
            .map((v) => String(v).padStart(3))
            .join(" ")}
        </span>
      ))}
    </div>
  );
}
