export default function GameBoard({ layout, children }) {
  return (
    <div
      className={`grid grid-cols-[repeat(var(--board-columns),1fr)] grid-rows-[repeat(var(--board-rows),1fr)] mx-auto aspect-square w-[min(100%,100cqh)]`}
      style={{
        "--board-columns": layout.columns,
        "--board-rows": layout.rows,
      }}
    >
      {children}
    </div>
  );
}
