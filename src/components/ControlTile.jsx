import { contrastingColor, formatColor } from "../utils";

export default function ControlTile({ color, label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        onClick(color);
      }}
      className="grid aspect-square cursor-pointer place-items-center text-2xl leading-none font-bold focus:outline-2 focus:outline-offset-2"
      style={{ backgroundColor: formatColor(color), color: formatColor(contrastingColor(color)) }}
    >
      {children}
    </button>
  );
}
