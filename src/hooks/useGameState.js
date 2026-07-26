import { useCallback, useState } from "react";
import { initializeGameState, offsetColor, channelOffset, colorsEqual } from "../utils";

export function useGameState({ tileCount, offsetMultiplier }) {
  const [{ colorTiles, targetColor }, setGameState] = useState(() =>
    initializeGameState(tileCount, offsetMultiplier),
  );
  const [tileIndex, setTileIndex] = useState(0);

  const handleOffsetColor = useCallback(
    (channel, delta) => {
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
