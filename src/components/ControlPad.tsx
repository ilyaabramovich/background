import ControlTile from "./ControlTile";
import { CHANNELS, offsetChannel } from "../color";
import type { Color } from "../color";
import { STEP } from "../config";

type ControlPadProps = {
  color: Color;
  isOver: boolean;
  onMove: (color: Color) => void;
};

export default function ControlPad({ color, isOver, onMove }: ControlPadProps) {
  return (
    <div
      className="mx-auto grid w-full max-w-60 gap-4 grid-cols-3 [[inert]]:opacity-40"
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
          const amount = delta * STEP;
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
