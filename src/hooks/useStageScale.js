import { useEffect, useState } from "react";
import { STAGE_W, STAGE_H } from "../utils/items.js";

// How much to shrink/grow the 1440 × 900 stage so it fits the window,
// and where to put it so it's centred.
function measure() {
  const scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
  return {
    scale,
    left: (window.innerWidth - STAGE_W * scale) / 2,
    top: (window.innerHeight - STAGE_H * scale) / 2,
  };
}

export default function useStageScale() {
  const [stage, setStage] = useState(measure);
  useEffect(() => {
    const onResize = () => setStage(measure());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return stage;
}
