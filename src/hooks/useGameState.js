import { useCallback, useState } from "react";
import { maxMoves as moveLimit } from "../config";
import { initializeGameState } from "../game";
import { offsetColor, channelOffset, colorsEqual } from "../utils";

export function useGameState({ board, offsetMultiplier }) {
  const maxMoves = moveLimit(board);

  const [{ initialColor, moves, targetColor }, setGameState] = useState(() =>
    initializeGameState(maxMoves, offsetMultiplier),
  );

  const handleOffsetColor = useCallback(
    (channel, delta) => {
      setGameState((gameState) => {
        if (gameState.moves.length >= maxMoves) {
          return gameState;
        }

        const previousColor = gameState.moves.at(-1) ?? gameState.initialColor;
        const offsets = channelOffset(channel, delta);
        const nextColor = offsetColor(previousColor, offsets, offsetMultiplier);

        return { ...gameState, moves: [...gameState.moves, nextColor] };
      });
    },
    [offsetMultiplier, maxMoves],
  );

  const goBack = useCallback(() => {
    setGameState((gameState) => ({ ...gameState, moves: gameState.moves.slice(0, -1) }));
  }, []);

  const restartGame = useCallback(() => {
    setGameState((gameState) => ({ ...gameState, moves: [] }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initializeGameState(maxMoves, offsetMultiplier));
  }, [maxMoves, offsetMultiplier]);

  const currentColor = moves.at(-1) ?? initialColor;

  const isComplete = moves.length === maxMoves;
  const status = !isComplete ? "playing" : colorsEqual(currentColor, targetColor) ? "won" : "lost";

  return {
    colors: [initialColor, ...moves],
    targetColor,
    currentColor,
    handleOffsetColor,
    status,
    resetGame,
    restartGame,
    goBack,
    canGoBack: moves.length > 0,
  };
}
