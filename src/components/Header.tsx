import type { GameMode } from "../game";

import ActionButton from "./ActionButton";

type HeaderProps = {
  gameMode: GameMode;
  onModeChange: (mode: GameMode) => void;
};

export default function Header({ gameMode, onModeChange }: HeaderProps) {
  return (
    <header className="flex w-full items-center justify-between gap-4">
      <h1 className="text-xl font-bold">{gameMode === "daily" ? "Daily puzzle" : "Free play"}</h1>
      <div className="flex gap-4">
        <ActionButton disabled={gameMode === "daily"} onClick={() => onModeChange("daily")}>
          Daily
        </ActionButton>
        <ActionButton onClick={() => onModeChange("free")}>Free play</ActionButton>
      </div>
    </header>
  );
}
