import type { Color } from "../color";
import type { GameStatus } from "../game";

import GameStatusOverlay from "./GameStatusOverlay";
import Tile from "./Tile";

type GameBoardProps = {
  from: Color;
  to: Color;
  status: GameStatus | null;
  children: React.ReactNode;
};

export default function GameBoard({ from, to, status, children }: GameBoardProps) {
  return (
    <div className="@container-size relative flex min-h-32 flex-1 items-center justify-center">
      <GameStatusOverlay from={from} to={to} status={status} />
      <ul className="grid aspect-square w-[min(100%,100cqh)] grid-cols-3 grid-rows-3">
        <Tile color={from} />
        {children}
        <Tile color={to} />
      </ul>
    </div>
  );
}
