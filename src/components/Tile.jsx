import { memo } from "react";
import { formatColor } from "../utils";

// A null color is an unfilled slot, so filling one updates this div in place
// instead of swapping it for a different component.
export default memo(function Tile({ color, className }) {
  return (
    <div
      className={className ? `aspect-square ${className}` : "aspect-square"}
      style={color == null ? undefined : { backgroundColor: formatColor(color) }}
    ></div>
  );
});
