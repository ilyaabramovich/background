import ColorTile from "./ColorTile";
import EmptyTile from "./EmptyTile";
import TargetColorTile from "./TargetColorTile";

export default function GameBoard({ style, colors, targetColor }) {
  return (
    <div
      className="grid grid-cols-[repeat(var(--board-columns),1fr)] grid-rows-[repeat(var(--board-rows),1fr)]"
      style={style}
    >
      {colors.map((color, idx) =>
        color ? <ColorTile key={idx} color={color} /> : <EmptyTile key={idx} />,
      )}
      <TargetColorTile color={targetColor} />
    </div>
  );
}
