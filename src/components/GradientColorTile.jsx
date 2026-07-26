export default function GradientColorTile({ current, preview, onClick, label, flipped }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`game-board__tile game-board__tile--control${
        flipped ? " game-board__tile--control-flipped" : ""
      }`}
      style={{
        "--tile-current": current,
        "--tile-preview": preview,
      }}
      onClick={onClick}
    />
  );
}
