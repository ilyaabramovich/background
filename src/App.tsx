import { useCallback, useState } from "react";

import Header from "./components/Header";
import Puzzle from "./components/Puzzle";
import { Game, type GameMode } from "./game";

function App() {
  const [game, setGame] = useState<Game>(() => new Game("daily"));

  const handleModeChange = useCallback((mode: GameMode) => setGame(new Game(mode)), []);

  return (
    <div className="flex min-h-dvh flex-col items-center gap-4 p-4">
      <Header gameMode={game.mode} onModeChange={handleModeChange} />
      <main className="flex w-full max-w-md flex-1">
        <Puzzle key={game.id} initialColor={game.initialColor} targetColor={game.targetColor} />
      </main>
    </div>
  );
}

export default App;
