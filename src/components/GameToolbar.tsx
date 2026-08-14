import { MAX_MOVES } from "../config";
import ActionButton from "./ActionButton";

type GameToolbarProps = {
  moveCount: number;
  onUndo: () => void;
  onRestart: () => void;
};

export default function GameToolbar({ moveCount, onUndo, onRestart }: GameToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-4">
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
        className="font-semibold whitespace-nowrap"
      >
        Moves: {moveCount}/{MAX_MOVES}
      </span>
    </div>
  );
}
