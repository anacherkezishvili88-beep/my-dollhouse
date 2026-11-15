import { useEffect, useRef, useState } from "react";
import { moveBy } from "../utils/pieces.js";

// Drags a placed piece around. Listens on the whole window so a drag
// keeps working even if the pointer moves quickly or leaves the piece,
// and so a drag can start on the scatter screen and finish in the room.
export default function usePieceDrag({ scale, setPlaced, onDragEnd }) {
  const drag = useRef(null);
  const [draggingUid, setDraggingUid] = useState(null);

  // Always call the latest onDragEnd (it reads fresh state).
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  function startDrag(uid, clientX, clientY, extra = {}) {
    drag.current = { uid, lastX: clientX, lastY: clientY, moved: false, ...extra };
    setDraggingUid(uid);
  }

  useEffect(() => {
    if (!draggingUid) return;

    function handleMove(event) {
      const d = drag.current;
      const dx = (event.clientX - d.lastX) / scale;
      const dy = (event.clientY - d.lastY) / scale;
      d.lastX = event.clientX;
      d.lastY = event.clientY;
      d.moved = true;
      setPlaced((list) => moveBy(list, d.uid, dx, dy));
    }

    function handleUp(event) {
      const d = drag.current;
      drag.current = null;
      setDraggingUid(null);
      onDragEndRef.current(d, event.clientX, event.clientY);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [draggingUid, scale, setPlaced]);

  return { draggingUid, startDrag };
}
