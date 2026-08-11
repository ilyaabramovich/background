import ActionButton from "./ActionButton";
import { MAX_MOVES } from "../config";

type GameActionsProps = {
  moveCount: number;
  date: Date | null;
  onGoBack: () => void;
  onRestart: () => void;
  onNewGame: () => void;
  onDaily: () => void;
};

export default function GameActions({
  moveCount,
  date,
  onGoBack,
  onRestart,
  onNewGame,
  onDaily,
}: GameActionsProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex gap-2">
        <ActionButton aria-label="Go back" onClick={onGoBack} disabled={moveCount === 0}>
          Back
        </ActionButton>
        <ActionButton onClick={onRestart} disabled={moveCount === 0}>
          Reset
        </ActionButton>
      </div>
      <span
        aria-hidden="true"
        data-testid="move-counter"
        className="text-sm font-semibold whitespace-nowrap"
      >
        <span className="hidden @[20rem]:inline">Moves: </span>
        {moveCount}/{MAX_MOVES}
      </span>
      <div className="flex gap-2">
        <ActionButton disabled={date !== null} onClick={onDaily}>
          Daily
        </ActionButton>
        <ActionButton aria-label="New game" onClick={onNewGame}>
          New
        </ActionButton>
      </div>
    </div>
  );
}
