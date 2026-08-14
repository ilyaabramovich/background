import { memo } from "react";

import type { Color } from "../color";

import EmptyTile from "./EmptyTile";

export default memo(function Tile({ color }: { color: Color | null }) {
  if (color === null) {
    return <EmptyTile />;
  }

  const formattedColor = color.toString();

  return (
    <li
      aria-label={formattedColor}
      aria-roledescription="tile"
      style={{ backgroundColor: formattedColor }}
    />
  );
});
