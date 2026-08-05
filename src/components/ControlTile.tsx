import { contrastingColor, formatColor } from "../color";
import type { Color } from "../color";

type ControlTileProps = {
  // The color this tile would produce, which is both what it paints itself and what it hands
  // back when clicked.
  color: Color;
  label: string;
  onClick: (color: Color) => void;
  children: React.ReactNode;
};

export default function ControlTile({ color, label, onClick, children }: ControlTileProps) {
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
