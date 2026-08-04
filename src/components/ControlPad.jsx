import ControlTile from "./ControlTile";
import { offsetChannel } from "../utils";

const CHANNELS = ["red", "green", "blue"];

export default function ControlPad({ color, step, isOver, onMove }) {
  return (
    <div
      className="grid gap-(--gap) grid-cols-[repeat(var(--control-columns),1fr)] [[inert]]:invisible"
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
