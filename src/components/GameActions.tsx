import { MAX_MOVES } from "../config";
import ActionButton from "./ActionButton";

type GameActionsProps = {
  moveCount: number;
  onUndo: () => void;
  onRestart: () => void;
};

export default function GameActions({ moveCount, onUndo, onRestart }: GameActionsProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex gap-2">
        <ActionButton onClick={onUndo} disabled={moveCount === 0}>
          Undo
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
        Moves: {moveCount}/{MAX_MOVES}
      </span>
    </div>
  );
}
