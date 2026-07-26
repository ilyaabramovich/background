import { useEffect, useRef } from "react";

const TargetColorTile = ({ color }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
  }, [color]);

  return (
    <div className="aspect-square [grid-area:var(--target-row)/var(--target-column)]">
      <canvas ref={canvasRef} width={1} height={1} className="block h-full w-full" />
    </div>
  );
};

export default TargetColorTile;
