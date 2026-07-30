import { colorToIntArray } from "../utils";

export default function ColorDebug({ color }) {
  return <span>{colorToIntArray(color)}</span>;
}
