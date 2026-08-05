import { useState } from "react";
import ControlPad from "./ControlPad";
import DebugOverlay from "./DebugOverlay";
import Tile from "./Tile";
import GameBoard from "./GameBoard";
import GameActions from "./GameActions";
import { describeColor } from "../utils";
import { formatPuzzleDate } from "../puzzle";
import { MAX_MOVES } from "../config";

export default function Game({ initialColor, targetColor, date, onNewGame, onDaily, config }) {
  const { board, offsetMultiplier } = config;
  const [moves, setMoves] = useState([]);

  const currentColor = moves.at(-1) ?? initialColor;
  const isOver = moves.length >= MAX_MOVES;
  const hasWon = isOver && currentColor === targetColor;
  const status = isOver ? (hasWon ? "You won yay!" : "Not this time") : null;

  function handleMove(nextColor) {
    setMoves((moves) => (isOver ? moves : [...moves, nextColor]));
  }

  function goBack() {
    setMoves((moves) => moves.slice(0, -1));
  }

  function restartGame() {
    setMoves([]);
  }

  return (
    <>
      <h1 className="text-center text-xl font-bold">
        {date === null ? "Free play" : `Daily puzzle · ${formatPuzzleDate(date)}`}
      </h1>
      <GameBoard layout={board} from={initialColor} to={targetColor} status={status}>
        {Array.from({ length: MAX_MOVES }, (_, idx) => (
          <Tile key={idx} color={moves[idx] ?? null} />
        ))}
      </GameBoard>
      {/* The heading already names the board, so the running commentary stays on the colors. */}
      <p className="sr-only" aria-live="polite">
        {`Current color ${describeColor(currentColor)}. Target color ${describeColor(targetColor)}. ${MAX_MOVES - moves.length} moves left.`}
      </p>
      {import.meta.env.DEV && <DebugOverlay colors={[currentColor, targetColor]} />}
      <GameActions
        moveCount={moves.length}
        date={date}
        onGoBack={goBack}
        onRestart={restartGame}
        onNewGame={onNewGame}
        onDaily={onDaily}
      />
      <ControlPad
        color={currentColor}
        step={offsetMultiplier}
        isOver={isOver}
        onMove={handleMove}
      />
    </>
  );
}
