export default function AppDebug({ children }) {
  return (
    <div
      className="flex gap-2"
      style={{
        fontFamily: "ui-monospace, monospace",
        whiteSpace: "pre",
        color: "#444",
      }}
    >
      {children}
    </div>
  );
}
