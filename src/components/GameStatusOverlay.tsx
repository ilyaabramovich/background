import { memo, useEffect, useRef } from "react";

import type { Color } from "../color";
import type { GameStatus } from "../game";

type GameStatusOverlayProps = {
  from: Color;
  to: Color;
  status: GameStatus | null;
};

function GameStatusOverlay({ from, to, status }: GameStatusOverlayProps) {
  const resultRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (status) {
      resultRef.current?.focus();
    }
  }, [status]);

  return (
    <div
      className={`pointer-events-none absolute grid aspect-square w-[min(100%,100cqh)] place-content-center transition-opacity duration-700 motion-reduce:transition-none ${
        status ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${from}, ${to})`,
        color: from.mix(to).contrasting().toString(),
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
  );
}

export default memo(GameStatusOverlay);
