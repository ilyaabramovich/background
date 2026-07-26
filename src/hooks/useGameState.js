import { useCallback, useState } from "react";
import { initializeGameState, offsetColor, channelOffset, colorsEqual } from "../utils";

const DEFAULT_GAME_CONFIG = {
  tileCount: 3,
  offsetMultiplier: 5,
};

export function useGameState(config = DEFAULT_GAME_CONFIG) {
  const { tileCount, offsetMultiplier } = { ...DEFAULT_GAME_CONFIG, ...config };
  const [{ colorTiles, targetColor }, setGameState] = useState(() =>
    initializeGameState(tileCount, offsetMultiplier),
  );
  const [tileIndex, setTileIndex] = useState(0);

  const handleOffsetColor = useCallback(
    (channel, delta) => {
      // The last tile is placed by branching from the one before it; nothing to do past that.
      if (tileIndex >= tileCount - 1) {
        return;
      }

      setGameState((gameState) => {
        const offsets = channelOffset(channel, delta);
        const nextTile = offsetColor(gameState.colorTiles[tileIndex], offsets, offsetMultiplier);
        const nextTiles = gameState.colorTiles.slice();
        nextTiles[tileIndex + 1] = nextTile;

        return {
          ...gameState,
          colorTiles: nextTiles,
        };
      });

      setTileIndex((index) => index + 1);
    },
    [tileIndex, offsetMultiplier, tileCount],
  );

  const goBack = useCallback(() => {
    // colorTiles[0..tileIndex] is the move history; step the cursor back and drop the
    // tile we're leaving so the board (and derived status) reflect the earlier state.
    if (tileIndex === 0) {
      return;
    }

    setGameState((gameState) => {
      const nextTiles = gameState.colorTiles.slice();
      nextTiles[tileIndex] = null;

      return {
        ...gameState,
        colorTiles: nextTiles,
      };
    });

    setTileIndex((index) => index - 1);
  }, [tileIndex]);

  const restartGame = useCallback(() => {
    // Keep the initial tile and target (same puzzle), clear every placed tile after it.
    setGameState((gameState) => ({
      ...gameState,
      colorTiles: gameState.colorTiles.map((tile, index) => (index === 0 ? tile : null)),
    }));
    setTileIndex(0);
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initializeGameState(tileCount, offsetMultiplier));
    setTileIndex(0);
  }, [tileCount, offsetMultiplier]);

  // Status is derived from the board, not stored — it can't desync from the tiles.
  const isComplete = colorTiles.every((tile) => tile != null);
  const status = !isComplete
    ? "playing"
    : colorsEqual(colorTiles.at(-1), targetColor)
      ? "won"
      : "lost";

  return {
    colorTiles,
    targetColor,
    handleOffsetColor,
    tileIndex,
    status,
    resetGame,
    restartGame,
    goBack,
    canGoBack: tileIndex > 0,
  };
}
