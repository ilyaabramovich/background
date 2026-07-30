export default function GameBoard({ layout, className, children }) {
  return (
    <div
      className={`grid grid-cols-[repeat(var(--board-columns),1fr)] grid-rows-[repeat(var(--board-rows),1fr)] ${className ?? ""}`}
      style={{
        "--board-columns": layout.columns,
        "--board-rows": layout.rows,
        "--target-row": layout.targetPosition.row,
        "--target-column": layout.targetPosition.column,
      }}
    >
      {children}
    </div>
  );
}
