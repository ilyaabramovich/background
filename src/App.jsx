import ActionButton from "./components/ActionButton";
import GameBoard from "./components/GameBoard";
import AppDebug from "./components/AppDebug";
import ControlTile from "./components/ControlTile";
import { CHANNELS, GAME_CONFIG } from "./config";
import { useGameState } from "./hooks/useGameState";
import { channelOffset, formatColor, offsetColor } from "./utils";
import ColorDebug from "./components/ColorDebug";

function App() {
  const {
    colors,
    targetColor,
    currentColor,
    handleOffsetColor,
    status,
    resetGame,
    restartGame,
    goBack,
    canGoBack,
  } = useGameState(GAME_CONFIG);

  return (
    <main className="mx-auto grid max-w-[30rem] gap-4 p-4">
      <GameBoard
        colors={colors.map(formatColor)}
        targetColor={formatColor(targetColor)}
        layout={GAME_CONFIG.board}
      />
      {import.meta.env.DEV && (
        <AppDebug>
          <ColorDebug color={currentColor} />
          <ColorDebug color={targetColor} />
        </AppDebug>
      )}
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
            <ControlTile
              key={name}
              aria-label={`Increment ${name}`}
              color={formatColor(
                offsetColor(currentColor, channelOffset(channel, 1), GAME_CONFIG.offsetMultiplier),
              )}
              onClick={() => handleOffsetColor(channel, 1)}
            />
          ))}
          {CHANNELS.map((name, channel) => (
            <ControlTile
              key={name}
              aria-label={`Decrement ${name}`}
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
