import { useState, useCallback } from "react";
import { GAME_CONFIG } from "./config";
import { randomColor, offsetColor, generateOffsets } from "./utils";
import Game from "./components/Game";

function App() {
  const { board, offsetMultiplier } = GAME_CONFIG;
  const offsetsCount = board.columns * board.rows - 2;

  const [initialColor, setInitialColor] = useState(randomColor);
  const offsets = generateOffsets(offsetsCount).map((offset) => offset * offsetMultiplier);
  const targetColor = offsetColor(initialColor, offsets);

  const handleReset = useCallback(() => {
    setInitialColor(randomColor);
  }, []);

  return (
    <main className="grid h-dvh justify-center p-[var(--pad)]">
      <div className="grid w-[var(--side)] grid-rows-[minmax(0,1fr)_auto_auto] gap-[var(--gap)]">
        <Game
          key={initialColor}
          initialColor={initialColor}
          targetColor={targetColor}
          onReset={handleReset}
          config={GAME_CONFIG}
        />
      </div>
    </main>
  );
}

export default App;
