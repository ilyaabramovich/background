import { useEffect, useRef } from "react";
import { contrastingColor, formatColor, mixColors } from "../utils";
import type { Color } from "../utils";
import type { BoardLayout, GameStatus } from "../config";
import Tile from "./Tile";

type GameBoardProps = {
  layout: BoardLayout;
  from: Color;
  to: Color;
  // null while the game is still going, which is what the effect below watches for.
  status: GameStatus | null;
  children: React.ReactNode;
};

export default function GameBoard({ layout, from, to, status, children }: GameBoardProps) {
  const resultRef = useRef<HTMLParagraphElement>(null);

  // The controls unmount the moment the game ends, which would otherwise drop focus onto
  // the body. Moving it to the result both keeps focus somewhere sensible and gets the
  // outcome read out, without an aria-live region repeating what the board already says.
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
            // The status text is centered, so it only ever sits on the middle of the gradient.
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
