import ActionButton from "./ActionButton";
import { MAX_MOVES } from "../config";

type GameActionsProps = {
  moveCount: number;
  // null is a free-play board, which is the only time the way back to the daily is offered.
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
    <div className="flex h-(--actions-h) items-center justify-between gap-2">
      {/* Labels are clipped to one word each: the row has to hold the counter and, in free
          play, a fourth button, on a board no wider than a phone. */}
      <div className="flex gap-2">
        <ActionButton aria-label="Go back" onClick={onGoBack} disabled={moveCount === 0}>
          Back
        </ActionButton>
        <ActionButton onClick={onRestart} disabled={moveCount === 0}>
          Reset
        </ActionButton>
      </div>
      {/* The move count is already read out by the board's live region, so it is decoration
          for anyone listening rather than looking. The word goes first when it is the last
          thing the row can afford. */}
      <span aria-hidden="true" className="text-sm font-semibold whitespace-nowrap">
        <span className="hidden @[20rem]:inline">Moves: </span>
        {moveCount}/{MAX_MOVES}
      </span>
      <div className="flex gap-2">
        {/* The heading names the board you are on; the way back to the daily only needs to
            exist once New game has taken you off it. */}
        {date === null && <ActionButton onClick={onDaily}>Daily</ActionButton>}
        <ActionButton aria-label="New game" onClick={onNewGame}>
          New
        </ActionButton>
      </div>
    </div>
  );
}
