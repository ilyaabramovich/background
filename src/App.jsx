import ActionButton from "./components/ActionButton";
import GameBoard from "./components/GameBoard";
import ColorDebug from "./components/ColorDebug";
import GradientColorTile from "./components/GradientColorTile";
import { useGameState } from "./hooks/useGameState";
import { channelOffset, formatColor, offsetColor } from "./utils";

const BOARD_LAYOUT = {
  columns: 3,
  rows: 3,
  targetPosition: {
    row: 3,
    column: 3,
  },
};

const BOARD_STYLE = {
  "--board-columns": BOARD_LAYOUT.columns,
  "--board-rows": BOARD_LAYOUT.rows,
  "--target-row": BOARD_LAYOUT.targetPosition.row,
  "--target-column": BOARD_LAYOUT.targetPosition.column,
};

const GAME_CONFIG = {
  tileCount: BOARD_LAYOUT.columns * BOARD_LAYOUT.rows - 1,
  offsetMultiplier: 10,
};

const CHANNELS = ["Red", "Green", "Blue"];

function App() {
  const {
    colorTiles,
    targetColor,
    handleOffsetColor,
    tileIndex,
    status,
    resetGame,
    restartGame,
    goBack,
    canGoBack,
  } = useGameState(GAME_CONFIG);
  const currentColor = colorTiles[tileIndex];

  return (
    <main className="mx-auto grid max-w-[30rem] gap-4 p-4">
      <GameBoard
        style={BOARD_STYLE}
        colors={colorTiles.map(formatColor)}
        targetColor={formatColor(targetColor)}
      />
      {import.meta.env.DEV && <ColorDebug color={currentColor} targetColor={targetColor} />}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <ActionButton onClick={goBack} disabled={!canGoBack}>
            Go back
          </ActionButton>
          <ActionButton onClick={restartGame} disabled={!canGoBack}>
            Reset
          </ActionButton>
        </div>
        {status !== "playing" && <ActionButton onClick={resetGame}>Play again</ActionButton>}
      </div>
      <div className="grid">
        <div
          className="col-start-1 row-start-1 grid gap-4 grid-cols-[repeat(var(--control-columns),1fr)] [&[inert]]:invisible"
          style={{ "--control-columns": CHANNELS.length }}
          inert={status !== "playing"}
        >
          {CHANNELS.map((name, channel) => (
            <GradientColorTile
              key={`more-${name}`}
              label={`More ${name}`}
              color={formatColor(
                offsetColor(currentColor, channelOffset(channel, 1), GAME_CONFIG.offsetMultiplier),
              )}
              onClick={() => handleOffsetColor(channel, 1)}
            />
          ))}
          {CHANNELS.map((name, channel) => (
            <GradientColorTile
              key={`less-${name}`}
              label={`Less ${name}`}
              color={formatColor(
                offsetColor(currentColor, channelOffset(channel, -1), GAME_CONFIG.offsetMultiplier),
              )}
              onClick={() => handleOffsetColor(channel, -1)}
            />
          ))}
        </div>
        {status !== "playing" && (
          <p className="col-start-1 row-start-1 self-center justify-self-center text-2xl font-bold">
            {status === "won" ? "Win!" : "Not this time"}
          </p>
        )}
      </div>
    </main>
  );
}

export default App;
