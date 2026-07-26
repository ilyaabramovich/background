export default function ControlTile({ color, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className="aspect-square cursor-pointer focus:outline-2 focus:outline-offset-2"
      style={{ backgroundColor: color }}
    />
  );
}
