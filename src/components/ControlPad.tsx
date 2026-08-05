import ControlTile from "./ControlTile";
import { CHANNELS, offsetChannel } from "../utils";
import type { Color } from "../utils";

type ControlPadProps = {
  color: Color;
  step: number;
  isOver: boolean;
  onMove: (color: Color) => void;
};

export default function ControlPad({ color, step, isOver, onMove }: ControlPadProps) {
  return (
    // Dimmed rather than hidden once the game is over: the result is drawn on the board now,
    // so nothing needs this space, and keeping the tiles in place means no layout shift when
    // Go back or Reset hands the controls straight back.
    <div
      className="grid gap-(--gap) grid-cols-[repeat(var(--control-columns),1fr)] [[inert]]:opacity-40"
      style={{ "--control-columns": CHANNELS.length }}
      inert={isOver}
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
              // The column heading carries the channel for sighted players, but each button
              // still needs to name it on its own for screen readers.
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
