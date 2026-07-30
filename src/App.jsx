import { useState } from "react";
import { GAME_CONFIG } from "./config";
import { randomColor, offsetColor, generateOffsets } from "./utils";
import Game from "./components/Game";

function App() {
  const { board, offsetMultiplier } = GAME_CONFIG;
  const offsetsCount = board.columns * board.rows - 2;

  const [initialColor, setInitialColor] = useState(randomColor);
  const offsets = generateOffsets(offsetsCount).map((offset) => offset * offsetMultiplier);
  const targetColor = offsetColor(initialColor, offsets);

  const handleReset = () => {
    setInitialColor(randomColor);
  };

  return (
    <main className="mx-auto grid max-w-[30rem] gap-4 p-4">
      <Game
        key={initialColor}
        initialColor={initialColor}
        targetColor={targetColor}
        onReset={handleReset}
        config={GAME_CONFIG}
      />
    </main>
  );
}

export default App;
