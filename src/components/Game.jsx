import { useState, useCallback } from "react";
import AppDebug from "./AppDebug";
import ControlTile from "./ControlTile";
import { offsetChannel } from "../utils";
import ColorDebug from "./ColorDebug";
import Tile from "./Tile";
import GameBoard from "./GameBoard";
import GameActions from "./GameActions";

const CHANNELS = ["red", "green", "blue"];

export default function Game({ initialColor, targetColor, onReset, config }) {
  const { board, offsetMultiplier } = config;
  const maxMoves = board.columns * board.rows - 2;

  // Fixed-length board slots plus a cursor, so every tile keeps a stable key for
  // its whole life and a move swaps exactly one of them.
  const [{ moves, step }, setProgress] = useState(() => ({
    moves: Array(maxMoves).fill(null),
    step: 0,
  }));

  const handleMove = useCallback((nextColor) => {
    setProgress((progress) => {
      const { moves, step } = progress;
      if (step >= moves.length) {
        return progress;
      }

      const next = moves.slice();
      next[step] = nextColor;
      return { moves: next, step: step + 1 };
    });
  }, []);

  // Rewinding only moves the cursor; slots past it are stale but never rendered,
  // and the untouched array keeps every remaining tile memo-equal.
  const goBack = useCallback(() => {
    setProgress(({ moves, step }) => ({ moves, step: Math.max(step - 1, 0) }));
  }, []);

  const restartGame = useCallback(() => {
    setProgress(({ moves }) => ({ moves, step: 0 }));
  }, []);

  const currentColor = step > 0 ? moves[step - 1] : initialColor;

  return (
    <>
      <GameBoard layout={board}>
        <Tile color={initialColor} />
        {moves.map((color, idx) => (
          <Tile key={idx} color={idx < step ? color : null} />
        ))}
        <Tile color={targetColor} className="[grid-area:var(--target-row)/var(--target-column)]" />
      </GameBoard>
      {import.meta.env.DEV && (
        <AppDebug>
          <ColorDebug color={currentColor} />
          <ColorDebug color={targetColor} />
        </AppDebug>
      )}
      <GameActions moveCount={step} onGoBack={goBack} onRestart={restartGame} onNewGame={onReset} />
      <div className="grid">
        {step < maxMoves ? (
          <div
            className="col-start-1 row-start-1 grid gap-4 grid-cols-[repeat(var(--control-columns),1fr)]"
            style={{ "--control-columns": CHANNELS.length }}
          >
            {[1, -1].flatMap((delta) =>
              CHANNELS.map((name, channel) => {
                const amount = delta * offsetMultiplier;
                const nextColor = offsetChannel(currentColor, channel, amount);

                return (
                  <ControlTile
                    key={`${name}${delta}`}
                    aria-label={`${delta > 0 ? "Increment" : "Decrement"} ${name}`}
                    color={nextColor}
                    onClick={handleMove}
                  />
                );
              }),
            )}
          </div>
        ) : (
          <p className="col-start-1 row-start-1 self-center justify-self-center text-2xl font-bold">
            {currentColor === targetColor ? "Win!" : "Not this time"}
          </p>
        )}
      </div>
    </>
  );
}
