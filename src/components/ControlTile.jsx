export default function GradientColorTile({ color, onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="aspect-square cursor-pointer"
      style={{ backgroundColor: color }}
      onClick={onClick}
    />
  );
}
