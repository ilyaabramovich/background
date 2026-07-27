import { useCallback, useState } from "react";
import { maxMoves as moveLimit } from "../config";
import { initializeColors, getGameStatus } from "../utils";

export function useGameState({ board, offsetMultiplier }) {
  const maxMoves = moveLimit(board);

  const [{ initialColor, targetColor }, setColors] = useState(() =>
    initializeColors(maxMoves, offsetMultiplier),
  );
  const [moves, setMoves] = useState([]);

  const handleMove = useCallback(
    (nextColor) => {
      setMoves((moves) => (moves.length >= maxMoves ? moves : [...moves, nextColor]));
    },
    [maxMoves],
  );

  const goBack = useCallback(() => {
    setMoves((moves) => moves.slice(0, -1));
  }, []);

  const restartGame = useCallback(() => {
    setMoves([]);
  }, []);

  const resetGame = useCallback(() => {
    setColors(initializeColors(maxMoves, offsetMultiplier));
    setMoves([]);
  }, [maxMoves, offsetMultiplier]);

  const hasProgress = moves.length > 0;
  const currentColor = hasProgress ? moves.at(-1) : initialColor;
  const status = getGameStatus(moves, maxMoves, currentColor, targetColor);

  return {
    colors: [initialColor, ...moves],
    targetColor,
    currentColor,
    handleMove,
    status,
    resetGame,
    restartGame,
    goBack,
    canGoBack: hasProgress,
    canRestart: hasProgress,
  };
}
