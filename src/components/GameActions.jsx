import ActionButton from "./ActionButton";
import { formatPuzzleDate } from "../puzzle";

export default function GameActions({ moveCount, date, onGoBack, onRestart, onNewGame, onDaily }) {
  return (
    <div className="flex h-(--actions-h) items-center justify-between gap-2">
      <div className="flex gap-2">
        <ActionButton onClick={onGoBack} disabled={moveCount === 0}>
          Go back
        </ActionButton>
        <ActionButton onClick={onRestart} disabled={moveCount === 0}>
          Reset
        </ActionButton>
      </div>
      {/* The middle slot names the board you are on, and becomes the way back to it once
          New game has taken you off the daily. */}
      {date === null ? (
        <ActionButton onClick={onDaily}>Daily</ActionButton>
      ) : (
        <span className="font-semibold whitespace-nowrap">{formatPuzzleDate(date)}</span>
      )}
      <ActionButton onClick={onNewGame}>New game</ActionButton>
    </div>
  );
}
