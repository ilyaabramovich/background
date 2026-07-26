export default function GradientColorTile({ current, preview, onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="game-board__tile game-board__tile--control"
      style={{
        "--tile-current": current,
        "--tile-preview": preview,
      }}
      onClick={onClick}
    />
  );
}
