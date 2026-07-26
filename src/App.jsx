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

const PREVIEW_OFFSET_MULTIPLIER = GAME_CONFIG.offsetMultiplier * 8;

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
  const currentHex = formatColor(currentColor);

  return (
    <main>
      <GameBoard
        style={BOARD_STYLE}
        colors={colorTiles.map(formatColor)}
        targetColor={formatColor(targetColor)}
      />
      <div className="app__panel">
        {/* {currentColor && <ColorDebug color={currentColor} targetColor={targetColor} />} */}
        <div className="game-actions">
          <button
            type="button"
            className="game-actions__button"
            onClick={goBack}
            disabled={!canGoBack}
          >
            Go back
          </button>
          <button
            type="button"
            className="game-actions__button"
            onClick={restartGame}
            disabled={!canGoBack}
          >
            Reset
          </button>
          {status !== "playing" && (
            <button
              type="button"
              className="game-actions__button game-actions__button--end"
              onClick={resetGame}
            >
              Play again
            </button>
          )}
        </div>
        <div className="game-board__stage">
          <div
            className="game-board__controls"
            style={{ "--control-columns": CHANNELS.length }}
            inert={status !== "playing"}
          >
            {CHANNELS.map((name, channel) => (
              <GradientColorTile
                key={`more-${name}`}
                label={`More ${name}`}
                current={currentHex}
                preview={formatColor(
                  offsetColor(currentColor, channelOffset(channel, 1), PREVIEW_OFFSET_MULTIPLIER),
                )}
                onClick={() => handleOffsetColor(channel, 1)}
              />
            ))}
            {CHANNELS.map((name, channel) => (
              <GradientColorTile
                key={`less-${name}`}
                label={`Less ${name}`}
                flipped
                current={currentHex}
                preview={formatColor(
                  offsetColor(currentColor, channelOffset(channel, -1), PREVIEW_OFFSET_MULTIPLIER),
                )}
                onClick={() => handleOffsetColor(channel, -1)}
              />
            ))}
          </div>
          {status !== "playing" && (
            <p className="game-board__result">{status === "won" ? "Win!" : "Not this time"}</p>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
