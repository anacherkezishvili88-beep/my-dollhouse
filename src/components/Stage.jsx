import { STAGE_W, STAGE_H } from "../utils/items.js";

// A 1440 × 900 layer scaled to fit the window. The room, the cart menu
// and the scatter screen each sit on one, so they all line up.
export default function Stage({ stage, className = "", children }) {
  return (
    <div
      className={`stage ${className}`}
      style={{
        width: STAGE_W,
        height: STAGE_H,
        left: stage.left,
        top: stage.top,
        transform: `scale(${stage.scale})`,
      }}
    >
      {children}
    </div>
  );
}
