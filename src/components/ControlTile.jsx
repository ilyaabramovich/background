export default function ControlTile({ color, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className="aspect-square cursor-pointer"
      style={{ backgroundColor: color }}
    />
  );
}
