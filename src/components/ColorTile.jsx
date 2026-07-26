export default function ColorTile({ color }) {
  return (
    <div
      className="game-board__tile"
      style={{ backgroundColor: color }}
    ></div>
  );
}
