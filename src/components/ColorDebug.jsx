export default function ColorDebug({ color }) {
  return <span>{`(${color.map((channel) => String(channel).padStart(3, " ")).join(", ")})`}</span>;
}
