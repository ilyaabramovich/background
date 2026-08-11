import { useState } from "react";
import { createPuzzle, dailySeed } from "./puzzle";
import Game from "./components/Game";

let nextGameId = 0;

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
    <main className="flex min-h-dvh justify-center p-4">
      <Game
        key={game.id}
        initialColor={game.initialColor}
        targetColor={game.targetColor}
        date={game.date}
        onNewGame={() => setGame(createGame(null))}
        onDaily={() => setGame(createGame(new Date()))}
      />
    </main>
  );
}

export default App;
