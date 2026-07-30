import ActionButton from "./ActionButton";

export default function GameActions({ moveCount, onGoBack, onRestart, onNewGame }) {
  return (
    <div className="flex h-(--actions-h) justify-between">
      <div className="flex gap-2">
        <ActionButton onClick={onGoBack} disabled={moveCount === 0}>
          Go back
        </ActionButton>
        <ActionButton onClick={onRestart} disabled={moveCount === 0}>
          Reset
        </ActionButton>
      </div>
      <ActionButton onClick={onNewGame}>New game</ActionButton>
    </div>
  );
}
