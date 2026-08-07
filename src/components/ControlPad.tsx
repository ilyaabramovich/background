import ControlTile from "./ControlTile";
import { CHANNELS, offsetChannel } from "../color";
import type { Color } from "../color";

type ControlPadProps = {
  color: Color;
  step: number;
  isOver: boolean;
  onMove: (color: Color) => void;
};

export default function ControlPad({ color, step, isOver, onMove }: ControlPadProps) {
  return (
    <div
      className="grid gap-(--gap) grid-cols-[repeat(var(--control-columns),1fr)] [[inert]]:opacity-40"
      style={{ "--control-columns": CHANNELS.length }}
      inert={isOver}
      data-testid="control-pad"
    >
      {CHANNELS.map(({ name }) => (
        <h2
          key={name}
          className="text-center text-sm leading-none font-semibold tracking-widest uppercase"
        >
          {name}
        </h2>
      ))}
      {[1, -1].flatMap((delta) =>
        CHANNELS.map(({ channel, name }) => {
          const amount = delta * step;
          const nextColor = offsetChannel(color, channel, amount);

          return (
            <ControlTile
              key={`${name}${delta}`}
              color={nextColor}
              label={`${delta > 0 ? "Increase" : "Decrease"} ${name}`}
              onClick={onMove}
            >
              {delta > 0 ? "+" : "−"}
            </ControlTile>
          );
        }),
      )}
    </div>
  );
}
