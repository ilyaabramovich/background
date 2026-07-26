import { useCallback, useState } from "react";
import { maxMoves as moveLimit } from "../config";
import { generateOffsets, offsetColor, channelOffset, colorsEqual, randomColor } from "../utils";

function initializeColors(maxMoves, offsetMultiplier) {
  const initialColor = randomColor();

  return {
    initialColor,
    targetColor: offsetColor(initialColor, generateOffsets(maxMoves), offsetMultiplier),
  };
}

export function useGameState({ board, offsetMultiplier }) {
  const maxMoves = moveLimit(board);

  const [{ initialColor, targetColor }, setPuzzle] = useState(() =>
    initializeColors(maxMoves, offsetMultiplier),
  );
  const [moves, setMoves] = useState([]);

  const handleOffsetColor = useCallback(
    (channel, delta) => {
      setMoves((moves) => {
        if (moves.length >= maxMoves) {
          return moves;
        }

        const previousColor = moves.at(-1) ?? initialColor;
        const offsets = channelOffset(channel, delta);
        const nextColor = offsetColor(previousColor, offsets, offsetMultiplier);

        return [...moves, nextColor];
      });
    },
    [initialColor, offsetMultiplier, maxMoves],
  );

  const goBack = useCallback(() => {
    setMoves((moves) => moves.slice(0, -1));
  }, []);

  const restartGame = useCallback(() => {
    setMoves([]);
  }, []);

  const resetGame = useCallback(() => {
    setPuzzle(initializeColors(maxMoves, offsetMultiplier));
    setMoves([]);
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
