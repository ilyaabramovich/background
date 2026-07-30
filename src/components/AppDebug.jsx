export default function AppDebug({ children }) {
  return (
    <div
      className="pointer-events-none fixed top-1 right-1 z-10 flex flex-col gap-2 text-xs"
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
