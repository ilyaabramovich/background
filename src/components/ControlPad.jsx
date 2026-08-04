import ControlTile from "./ControlTile";
import { offsetChannel } from "../utils";

const CHANNELS = ["red", "green", "blue"];

export default function ControlPad({ color, step, isOver, onMove }) {
  return (
    // Dimmed rather than hidden once the game is over: the result is drawn on the board now,
    // so nothing needs this space, and keeping the tiles in place means no layout shift when
    // Go back or Reset hands the controls straight back.
    <div
      className="grid gap-(--gap) grid-cols-[repeat(var(--control-columns),1fr)] [[inert]]:opacity-40"
      style={{ "--control-columns": CHANNELS.length }}
      inert={isOver}
    >
      {[1, -1].flatMap((delta) =>
        CHANNELS.map((name, channel) => {
          const amount = delta * step;
          const nextColor = offsetChannel(color, channel, amount);

          return (
            <ControlTile key={`${name}${delta}`} color={nextColor} onClick={onMove}>
              {name} {delta > 0 ? "+" : "-"}
            </ControlTile>
          );
        }),
      )}
    </div>
  );
}
