import { useState } from "react";
import ControlPad from "./ControlPad";
import DebugOverlay from "./DebugOverlay";
import Tile from "./Tile";
import GameBoard from "./GameBoard";
import GameActions from "./GameActions";
import { MAX_MOVES } from "../config";

export default function Game({ initialColor, targetColor, onReset, config }) {
  const { board, offsetMultiplier } = config;
  const [moves, setMoves] = useState([]);

  const currentColor = moves.at(-1) ?? initialColor;
  const isOver = moves.length >= MAX_MOVES;
  const hasWon = isOver && currentColor === targetColor;

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
      <GameBoard layout={board} from={initialColor} to={targetColor} revealed={hasWon}>
        {Array.from({ length: MAX_MOVES }, (_, idx) => (
          <Tile key={idx} color={moves[idx] ?? null} />
        ))}
      </GameBoard>
      {import.meta.env.DEV && <DebugOverlay colors={[currentColor, targetColor]} />}
      <GameActions
        moveCount={moves.length}
        onGoBack={goBack}
        onRestart={restartGame}
        onNewGame={onReset}
      />
      <ControlPad
        color={currentColor}
        step={offsetMultiplier}
        isOver={isOver}
        hasWon={hasWon}
        onMove={handleMove}
      />
    </>
  );
}
