import { useState } from "react";
import { GAME_CONFIG, MAX_MOVES } from "./config";
import { randomColor, offsetColor, generateOffsets } from "./utils";
import Game from "./components/Game";

let nextGameId = 0;

function createGame() {
  const initialColor = randomColor();
  const offsets = generateOffsets(MAX_MOVES).map((offset) => offset * GAME_CONFIG.offsetMultiplier);

  return {
    id: nextGameId++,
    initialColor,
    targetColor: offsetColor(initialColor, offsets),
  };
}

function App() {
  const [game, setGame] = useState(createGame);

  return (
    <main className="grid h-dvh justify-center p-(--pad)">
      <div className="grid w-(--side) grid-rows-[minmax(0,1fr)_auto_auto] gap-(--gap)">
        <Game
          key={game.id}
          initialColor={game.initialColor}
          targetColor={game.targetColor}
          onReset={() => setGame(createGame())}
          config={GAME_CONFIG}
        />
      </div>
    </main>
  );
}

export default App;
