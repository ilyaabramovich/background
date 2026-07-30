import { useState } from "react";
import AppDebug from "./AppDebug";
import ControlTile from "./ControlTile";
import { offsetChannel } from "../utils";
import ColorDebug from "./ColorDebug";
import Tile from "./Tile";
import GameBoard from "./GameBoard";
import GameActions from "./GameActions";
import { MAX_MOVES } from "../config";

const CHANNELS = ["red", "green", "blue"];

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
      <div className="min-h-0 @container-size">
        <GameBoard layout={board} gradient={[initialColor, targetColor]} revealed={hasWon}>
          <Tile color={initialColor} />
          {Array.from({ length: MAX_MOVES }, (_, idx) => (
            <Tile key={idx} color={moves[idx] ?? null} />
          ))}
          <Tile color={targetColor} />
        </GameBoard>
      </div>
      {import.meta.env.DEV && (
        <AppDebug>
          <ColorDebug color={currentColor} />
          <ColorDebug color={targetColor} />
        </AppDebug>
      )}
      <GameActions
        moveCount={moves.length}
        onGoBack={goBack}
        onRestart={restartGame}
        onNewGame={onReset}
      />
      <div className="grid">
        <div
          className="col-start-1 row-start-1 grid gap-(--gap) grid-cols-[repeat(var(--control-columns),1fr)] [[inert]]:invisible"
          style={{ "--control-columns": CHANNELS.length }}
          inert={isOver}
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
        {isOver && (
          <p className="col-start-1 row-start-1 self-center justify-self-center text-2xl font-bold">
            {hasWon ? "Win!" : "Not this time"}
          </p>
        )}
      </div>
    </>
  );
}
