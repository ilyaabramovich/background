import { useState, useCallback } from "react";
import ActionButton from "./ActionButton";
import AppDebug from "./AppDebug";
import ControlTile from "./ControlTile";
import { offsetChannel } from "../utils";
import ColorDebug from "./ColorDebug";
import ColorTile from "./ColorTile";
import EmptyTile from "./EmptyTile";
import TargetColorTile from "./TargetColorTile";
import GameBoard from "./GameBoard";

const CHANNELS = ["red", "green", "blue"];

export default function Game({ initialColor, targetColor, onReset, config }) {
  const [moves, setMoves] = useState([]);

  const { board, offsetMultiplier } = config;
  const maxMoves = board.columns * board.rows - 2;

  const handleMove = useCallback((nextColor) => {
    setMoves((moves) => [...moves, nextColor]);
  }, []);

  const goBack = useCallback(() => {
    setMoves((moves) => moves.slice(0, -1));
  }, []);

  const restartGame = () => {
    setMoves([]);
  };

  const currentColor = moves.at(-1) ?? initialColor;

  const emptyTiles = Array.from({ length: maxMoves - moves.length }, (_, idx) => (
    <EmptyTile key={idx} />
  ));

  return (
    <>
      <GameBoard layout={board}>
        <ColorTile color={initialColor} />
        {moves.map((color, idx) => (
          <ColorTile key={idx} color={color} />
        ))}
        {emptyTiles}
        <TargetColorTile color={targetColor} />
      </GameBoard>
      {import.meta.env.DEV && (
        <AppDebug>
          <ColorDebug color={currentColor} />
          <ColorDebug color={targetColor} />
        </AppDebug>
      )}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <ActionButton onClick={goBack} disabled={moves.length === 0}>
            Go back
          </ActionButton>
          <ActionButton onClick={restartGame} disabled={moves.length === 0}>
            Reset
          </ActionButton>
        </div>
        <ActionButton onClick={onReset}>New game</ActionButton>
      </div>
      <div className="grid">
        {moves.length < maxMoves ? (
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
