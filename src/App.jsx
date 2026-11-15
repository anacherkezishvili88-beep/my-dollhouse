import { useEffect, useRef, useState } from "react";
import Stage from "./components/Stage.jsx";
import Piece from "./components/Piece.jsx";
import CartMenu from "./components/CartMenu.jsx";
import ScatterView from "./components/ScatterView.jsx";
import { CartButton, EraseButton, UndoButton, HomeNote } from "./components/CornerButtons.jsx";
import useSavedState from "./hooks/useSavedState.js";
import useStageScale from "./hooks/useStageScale.js";
import usePieceDrag from "./hooks/usePieceDrag.js";
import { categories, getItem, isClothing, itemsInCategory, makeUid } from "./utils/items.js";
import { scatterItems } from "./utils/scatter.js";
import { findCharacterAt, findPieceAt, isOverEraseButton } from "./utils/hitTest.js";
import {
  attachTo,
  bringToFront,
  detach,
  findPiece,
  nextZ,
  removePiece,
  topLevelInOrder,
  updatePiece,
} from "./utils/pieces.js";
import "./styles/app.css";

const MAX_UNDO = 60;

export default function App() {
  // ---- State --------------------------------------------------------------
  // Everything in the room (see utils/pieces.js for the shape of a piece).
  const [placed, setPlaced] = useSavedState("my-dollhouse-room", () => []);
  // Earlier versions of `placed`, for ctrl+z.
  const [history, setHistory] = useState([]);
  // Which screen is showing on top of the room: "room" | "menu" | "scatter".
  const [view, setView] = useState("room");
  const [activeCategory, setActiveCategory] = useState(null);
  // Items currently tossed around the page on the scatter screen.
  const [scattered, setScattered] = useState([]);
  const [scatterRound, setScatterRound] = useState(0); // new number = replay the toss animation
  const [isErasing, setIsErasing] = useState(false);

  const stage = useStageScale();
  const lastWheel = useRef(0);

  // ---- Undo -----------------------------------------------------------------
  function remember(snapshot) {
    setHistory((h) => [...h.slice(-MAX_UNDO + 1), snapshot]);
  }

  function undo() {
    if (history.length === 0) return;
    setPlaced(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  }

  // ---- Dragging -------------------------------------------------------------
  const { draggingUid, startDrag } = usePieceDrag({
    scale: stage.scale,
    setPlaced,
    onDragEnd: handleDrop,
  });

  // Decide what a drop means: delete it, dress someone, undress someone,
  // or just leave it where it is.
  function handleDrop(drag, clientX, clientY) {
    const piece = findPiece(placed, drag.uid);
    if (!piece) return;

    if (isOverEraseButton(clientX, clientY)) {
      setPlaced((list) => removePiece(list, drag.uid));
    } else if (isClothing(getItem(piece.itemId))) {
      const characterUid = findCharacterAt(clientX, clientY, drag.uid);
      if (characterUid && characterUid !== piece.parent) {
        setPlaced((list) => attachTo(list, drag.uid, characterUid));
      } else if (!characterUid && piece.parent) {
        setPlaced((list) => detach(list, drag.uid));
      }
    }
    if (drag.moved || drag.isNew) remember(drag.snapshot);
  }

  // Pressing on the room: grab (or erase) whatever is under the pointer.
  function handleRoomPointerDown(event) {
    if (event.button !== 0 || view !== "room") return;
    if (event.target.closest("button")) return; // corner buttons handle their own clicks
    const uid = findPieceAt(event.clientX, event.clientY);
    if (!uid) {
      setIsErasing(false);
      return;
    }
    event.preventDefault();
    if (isErasing) {
      remember(placed);
      setPlaced((list) => removePiece(list, uid));
      return;
    }
    const snapshot = placed;
    setPlaced((list) => bringToFront(list, uid));
    startDrag(uid, event.clientX, event.clientY, { snapshot });
  }

  // Scroll / pinch over something to make it bigger or smaller.
  function handleWheel(event) {
    if (view !== "room") return;
    const uid = findPieceAt(event.clientX, event.clientY);
    if (!uid) return;
    if (Date.now() - lastWheel.current > 600) remember(placed); // one undo step per gesture
    lastWheel.current = Date.now();
    const factor = Math.exp(-event.deltaY * 0.0015);
    setPlaced((list) => {
      const piece = findPiece(list, uid);
      const scale = Math.min(4, Math.max(0.25, piece.scale * factor));
      return updatePiece(list, uid, { scale });
    });
  }

  // ---- Cart → section → scatter ---------------------------------------------
  function openMenu() {
    setIsErasing(false);
    setView(view === "menu" ? "room" : "menu");
  }

  function openCategory(categoryId) {
    setActiveCategory(categoryId);
    setScattered(scatterItems(itemsInCategory(categoryId)));
    setScatterRound((n) => n + 1);
    setView("scatter");
  }

  // Picking something up from the scatter screen puts it straight into
  // the room under the pointer, already being dragged.
  function pickUpFromScatter(entry, event) {
    const item = getItem(entry.itemId);
    const pointX = (event.clientX - stage.left) / stage.scale;
    const pointY = (event.clientY - stage.top) / stage.scale;
    // keep the same grab point, at full size
    const grabX = (pointX - entry.x) / entry.scale;
    const grabY = (pointY - entry.y) / entry.scale;
    const piece = {
      uid: makeUid(),
      itemId: item.id,
      x: pointX - grabX,
      y: pointY - grabY,
      scale: 1,
      z: nextZ(placed),
      parent: null,
    };
    const snapshot = placed;
    setPlaced((list) => [...list, piece]);
    setScattered((list) => list.filter((e) => e.itemId !== entry.itemId));
    startDrag(piece.uid, event.clientX, event.clientY, { snapshot, isNew: true });
  }

  // ---- Keyboard shortcuts ----------------------------------------------------
  useEffect(() => {
    function handleKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
      } else if (event.key === "Escape") {
        setView("room");
        setIsErasing(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // ---- Render ------------------------------------------------------------------
  const isEmpty = placed.length === 0;
  const category = categories.find((c) => c.id === activeCategory);
  const overlayHidden = draggingUid !== null; // see the room while dragging

  return (
    <div
      className={`app ${isErasing ? "is-erasing" : ""} ${draggingUid ? "is-dragging" : ""}`}
      onPointerDown={handleRoomPointerDown}
      onWheel={handleWheel}
    >
      {/* The room itself */}
      <Stage stage={stage} className="room">
        {topLevelInOrder(placed).map((piece, index) => (
          <Piece
            key={piece.uid}
            piece={piece}
            placed={placed}
            layer={index + 1}
            draggingUid={draggingUid}
          />
        ))}
      </Stage>

      {view === "room" && isEmpty && <HomeNote onClick={openMenu} />}

      {/* Screens that open on top of the room */}
      {view !== "room" && (
        <div
          className={`overlay ${overlayHidden ? "is-hidden" : ""}`}
          onPointerDown={(event) => {
            event.stopPropagation();
            if (event.target === event.currentTarget) setView("room");
          }}
        >
          <Stage stage={stage} className="overlay-stage">
            {view === "menu" && <CartMenu onPick={openCategory} />}
            {view === "scatter" && category && (
              <ScatterView
                key={scatterRound}
                label={category.label}
                scattered={scattered}
                onPickUp={pickUpFromScatter}
              />
            )}
          </Stage>
        </div>
      )}

      {/* Corner buttons (the cart hides while its menu is open, like the prototype) */}
      {view !== "menu" && <CartButton onClick={openMenu} isInviting={isEmpty} />}
      {view === "room" && !isEmpty && (
        <EraseButton isActive={isErasing} onClick={() => setIsErasing((on) => !on)} />
      )}
      {view === "room" && (!isEmpty || history.length > 0) && (
        <UndoButton onClick={undo} disabled={history.length === 0} />
      )}
    </div>
  );
}
