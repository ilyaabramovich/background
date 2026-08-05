import { useState } from "react";
import { GAME_CONFIG } from "./config";
import { createPuzzle, dailySeed } from "./puzzle";
import Game from "./components/Game";

let nextGameId = 0;

// date is the day whose board this is, or null for a free-play board off a random seed.
function createGame(date: Date | null) {
  return {
    id: nextGameId++,
    date,
    ...(date === null ? createPuzzle() : createPuzzle(dailySeed(date))),
  };
}

function App() {
  const [game, setGame] = useState(() => createGame(new Date()));

  return (
    <main className="grid h-dvh justify-center p-(--pad)">
      <div className="@container grid w-(--side) grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-(--gap)">
        <Game
          key={game.id}
          initialColor={game.initialColor}
          targetColor={game.targetColor}
          date={game.date}
          onNewGame={() => setGame(createGame(null))}
          onDaily={() => setGame(createGame(new Date()))}
          config={GAME_CONFIG}
        />
      </div>
    </main>
  );
}

export default App;
