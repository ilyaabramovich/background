import { contrastingColor, formatColor } from "../utils";

export default function ControlTile({ color, onClick, children }) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick(color);
      }}
      className="aspect-square cursor-pointer focus:outline-2 focus:outline-offset-2"
      style={{ backgroundColor: formatColor(color), color: formatColor(contrastingColor(color)) }}
    >
      {children}
    </button>
  );
}
