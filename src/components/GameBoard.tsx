import { useEffect, useRef } from "react";
import { contrastingColor, formatColor, mixColors } from "../color";
import type { Color } from "../color";
import type { BoardLayout } from "../config";
import type { GameStatus } from "../status";
import Tile from "./Tile";

type GameBoardProps = {
  layout: BoardLayout;
  from: Color;
  to: Color;
  status: GameStatus | null;
  children: React.ReactNode;
};

export default function GameBoard({ layout, from, to, status, children }: GameBoardProps) {
  const resultRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (status) {
      resultRef.current?.focus();
    }
  }, [status]);

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
            color: formatColor(contrastingColor(mixColors(from, to))),
          }}
        >
          <p ref={resultRef} tabIndex={-1} className="text-2xl font-bold focus:outline-none">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
