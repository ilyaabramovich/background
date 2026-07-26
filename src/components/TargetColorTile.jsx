import { useLayoutEffect, useRef } from "react";

const TargetColorTile = ({ color }) => {
  const canvasRef = useRef(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
  }, [color]);

  return (
    <div className="game-board__tile game-board__tile--target">
      <canvas
        ref={canvasRef}
        width={1}
        height={1}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
};

export default TargetColorTile;
