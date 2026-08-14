import { useState } from "react";

import type { Color } from "../color";

import { MAX_MOVES } from "../config";
import { GAME_STATUS } from "../game";
import ControlPad from "./ControlPad";
import DebugOverlay from "./DebugOverlay";
import GameActions from "./GameActions";
import GameBoard from "./GameBoard";
import Tile from "./Tile";

type PuzzleProps = {
  initialColor: Color;
  targetColor: Color;
};

export default function Puzzle({ initialColor, targetColor }: PuzzleProps) {
  const [moves, setMoves] = useState<Color[]>([]);

  const currentColor = moves.at(-1) ?? initialColor;
  const isOver = moves.length >= MAX_MOVES;
  const hasWon = isOver && currentColor.equals(targetColor);
  const status = isOver ? (hasWon ? GAME_STATUS.won : GAME_STATUS.lost) : null;

  const handleMove = (nextColor: Color) => {
    setMoves((moves) => (moves.length >= MAX_MOVES ? moves : [...moves, nextColor]));
  };

  const handleUndo = () => {
    setMoves((moves) => moves.slice(0, -1));
  };

  const handleRestart = () => {
    setMoves([]);
  };

  return (
    <div className="@container flex w-full max-w-md flex-col gap-4">
      <GameBoard from={initialColor} to={targetColor} status={status}>
        {Array.from({ length: MAX_MOVES }, (_, idx) => (
          <Tile key={idx} color={moves[idx] ?? null} />
        ))}
      </GameBoard>
      <p className="sr-only" aria-live="polite" data-testid="announcer">
        {`Current color ${currentColor.describe()}. Target color ${targetColor.describe()}. ${MAX_MOVES - moves.length} moves left.`}
      </p>
      {import.meta.env.DEV && <DebugOverlay colors={[currentColor, targetColor]} />}
      <GameActions moveCount={moves.length} onUndo={handleUndo} onRestart={handleRestart} />
      <ControlPad color={currentColor} isOver={isOver} onMove={handleMove} />
    </div>
  );
}
