import { formatColor } from "../utils";
import Tile from "./Tile";

export default function GameBoard({ layout, from, to, revealed, children }) {
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
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `linear-gradient(to bottom right, ${formatColor(from)}, ${formatColor(to)})`,
          }}
        />
      </div>
    </div>
  );
}
