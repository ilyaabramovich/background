import { contrastingColor, formatColor, mixColors } from "../utils";
import Tile from "./Tile";

export default function GameBoard({ layout, from, to, status, children }) {
  return (
    <div className="min-h-0 @container-size">
      <div
        className="relative grid grid-cols-[repeat(var(--board-columns),1fr)] grid-rows-[repeat(var(--board-rows),1fr)] mx-auto aspect-(--board-aspect) w-[min(100%,calc(100cqh*var(--board-aspect)))]"
        style={{
          "--board-columns": layout.columns,
          "--board-rows": layout.rows,
          "--board-aspect": `${layout.columns}/${layout.rows}`,
        }}
      >
        <Tile color={from} />
        {children}
        <Tile color={to} />
        <div
          className={`pointer-events-none absolute inset-0 grid place-content-center transition-opacity duration-700 motion-reduce:transition-none ${
            status ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `linear-gradient(to bottom right, ${formatColor(from)}, ${formatColor(to)})`,
            // The status text is centered, so it only ever sits on the middle of the gradient.
            color: formatColor(contrastingColor(mixColors(from, to))),
          }}
        >
          <p className="text-2xl font-bold">{status}</p>
        </div>
      </div>
    </div>
  );
}
