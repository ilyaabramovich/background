import { formatColor } from "../utils";

export default function ControlTile({ color, onClick, ...props }) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick(color);
      }}
      {...props}
      className="aspect-square cursor-pointer focus:outline-2 focus:outline-offset-2"
      style={{ backgroundColor: formatColor(color) }}
    />
  );
}
