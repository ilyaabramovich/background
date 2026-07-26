import { tileCount } from "../config";
import ColorTile from "./ColorTile";
import EmptyTile from "./EmptyTile";
import TargetColorTile from "./TargetColorTile";

export default function GameBoard({ colors, targetColor, layout }) {
  const emptyTiles = Array.from({ length: tileCount(layout) - colors.length }, (_, idx) => (
    <EmptyTile key={idx} />
  ));

  return (
    <div
      className="grid grid-cols-[repeat(var(--board-columns),1fr)] grid-rows-[repeat(var(--board-rows),1fr)]"
      style={{
        "--board-columns": layout.columns,
        "--board-rows": layout.rows,
        "--target-row": layout.targetPosition.row,
        "--target-column": layout.targetPosition.column,
      }}
    >
      {colors.map((color, idx) => (
        <ColorTile key={idx} color={color} />
      ))}
      {emptyTiles}
      <TargetColorTile color={targetColor} />
    </div>
  );
}
