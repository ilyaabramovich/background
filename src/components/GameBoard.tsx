import { useEffect, useRef } from "react";
import { contrastingColor, formatColor, mixColors } from "../color";
import type { Color } from "../color";
import type { GameStatus } from "../status";
import Tile from "./Tile";

type GameBoardProps = {
  from: Color;
  to: Color;
  status: GameStatus | null;
  children: React.ReactNode;
};

export default function GameBoard({ from, to, status, children }: GameBoardProps) {
  const resultRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (status) {
      resultRef.current?.focus();
    }
  }, [status]);

  return (
    <div className="@container-size flex min-h-32 flex-1 items-center justify-center">
      <div className="relative grid aspect-square w-[min(100%,100cqh)] grid-cols-3 grid-rows-3">
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
          <p
            ref={resultRef}
            tabIndex={-1}
            data-testid="game-status"
            className="text-2xl font-bold focus:outline-none"
          >
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
