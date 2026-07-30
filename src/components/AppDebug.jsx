export default function AppDebug({ children }) {
  return (
    <div
      className="pointer-events-none fixed bottom-1 left-1 z-10 flex gap-2 text-xs"
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
