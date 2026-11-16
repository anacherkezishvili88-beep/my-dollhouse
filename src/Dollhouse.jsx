// These hooks let our components have state, run effects, and keep
// values between renders
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

import { Piece } from "./Cutout.jsx";
import { CartMenu, ScatterView } from "./Menus.jsx";
import {
  STAGE_WIDTH,
  STAGE_HEIGHT,
  assetUrl,
  bringToFront,
  categories,
  findCharacterAt,
  findPiece,
  findPieceAt,
  getItem,
  isClothing,
  isOverErase,
  itemsInCategory,
  makeId,
  measureStage,
  moveBy,
  nextZ,
  piecesInOrder,
  putOn,
  removePiece,
  scatterItems,
  takeOff,
  updatePiece,
} from "./helpers.js";

// Load the room from last time, if there is one
let savedRoom = localStorage.getItem("dollhouse");

if (savedRoom != null) {
  savedRoom = JSON.parse(savedRoom);
} else {
  savedRoom = [];
}

// This is the main component which is exported for use in main.jsx
export function Dollhouse() {
  // Everything that's in the room (see helpers.js for what a piece looks like)
  let [pieces, setPieces] = useState(savedRoom);

  // Older versions of the room, so ctrl+z can go back
  let [history, setHistory] = useState([]);

  // What's showing on top of the room: "room", "menu" or "scatter"
  let [view, setView] = useState("room");

  // The section that was picked in the cart, and where its items landed
  let [section, setSection] = useState(null);
  let [scattered, setScattered] = useState([]);

  // Goes up every time a section is opened, to replay the animation
  let [scatterRound, setScatterRound] = useState(0);

  // Whether the erase button is turned on
  let [erasing, setErasing] = useState(false);

  // The size and position of the canvas in the window
  let [stage, setStage] = useState(measureStage());

  // The piece being dragged right now (or null)
  let [draggingId, setDraggingId] = useState(null);

  // Info about the drag that doesn't need to cause a re-render
  let drag = useRef(null);
  let lastScroll = useRef(0);

  // Save the room whenever it changes
  useEffect(() => {
    localStorage.setItem("dollhouse", JSON.stringify(pieces));
  }, [pieces]);

  // Resize the canvas when the window changes size
  useEffect(() => {
    function onResize() {
      setStage(measureStage());
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ---------- Undo ---------- */

  function remember(oldPieces) {
    setHistory((list) => [...list.slice(-59), oldPieces]);
  }

  function undo() {
    if (history.length == 0) {
      return;
    }
    setPieces(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  }

  /* ---------- Dragging ---------- */

  function startDrag(id, event, isNew) {
    drag.current = {
      id: id,
      lastX: event.clientX,
      lastY: event.clientY,
      moved: false,
      isNew: isNew,
      before: pieces,
    };
    setDraggingId(id);
  }

  // While something is being dragged, listen to the mouse on the whole
  // window. This way the drag keeps going even if the mouse moves fast,
  // and you can start dragging on the scatter screen and drop in the room
  useEffect(() => {
    if (draggingId == null) {
      return;
    }

    function onMove(event) {
      let d = drag.current;
      let dx = (event.clientX - d.lastX) / stage.scale;
      let dy = (event.clientY - d.lastY) / stage.scale;
      d.lastX = event.clientX;
      d.lastY = event.clientY;
      d.moved = true;
      setPieces((list) => moveBy(list, d.id, dx, dy));
    }

    function onUp(event) {
      let d = drag.current;
      drag.current = null;
      setDraggingId(null);
      drop(d, event.clientX, event.clientY);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [draggingId, stage.scale]);

  // When something is dropped: delete it if it's on the erase button,
  // put clothes on a character, or take them off
  function drop(d, mouseX, mouseY) {
    let overErase = isOverErase(mouseX, mouseY);
    let characterId = findCharacterAt(mouseX, mouseY, d.id);

    setPieces((list) => {
      let piece = findPiece(list, d.id);
      if (piece == null) {
        return list;
      }
      if (overErase) {
        return removePiece(list, d.id);
      }
      if (isClothing(getItem(piece.itemId))) {
        if (characterId != null && characterId != piece.parent) {
          return putOn(list, d.id, characterId);
        }
        if (characterId == null && piece.parent != null) {
          return takeOff(list, d.id);
        }
      }
      return list;
    });

    if (d.moved || d.isNew) {
      remember(d.before);
    }
  }

  // Pressing down in the room: pick up (or erase) what's under the mouse
  function pressRoom(event) {
    if (event.button != 0 || view != "room") {
      return;
    }
    // the corner buttons handle their own clicks
    if (event.target.closest("button")) {
      return;
    }

    let id = findPieceAt(event.clientX, event.clientY);
    if (id == null) {
      setErasing(false);
      return;
    }
    event.preventDefault();

    if (erasing) {
      remember(pieces);
      setPieces(removePiece(pieces, id));
      return;
    }

    setPieces(bringToFront(pieces, id));
    startDrag(id, event, false);
  }

  // Scrolling over something makes it bigger or smaller
  function scrollRoom(event) {
    if (view != "room") {
      return;
    }
    let id = findPieceAt(event.clientX, event.clientY);
    if (id == null) {
      return;
    }
    // only save one undo step for each scroll gesture
    if (Date.now() - lastScroll.current > 600) {
      remember(pieces);
    }
    lastScroll.current = Date.now();

    let zoom = Math.exp(-event.deltaY * 0.0015);
    setPieces((list) => {
      let piece = findPiece(list, id);
      let scale = piece.scale * zoom;
      scale = Math.min(4, Math.max(0.25, scale));
      return updatePiece(list, id, { scale: scale });
    });
  }

  /* ---------- Cart, sections and scatter ---------- */

  function toggleMenu() {
    setErasing(false);
    if (view == "menu") {
      setView("room");
    } else {
      setView("menu");
    }
  }

  function openSection(categoryId) {
    setSection(categoryId);
    setScattered(scatterItems(itemsInCategory(categoryId), categoryId));
    setScatterRound(scatterRound + 1);
    setView("scatter");
  }

  // Picking something up on the scatter screen puts it in the room
  // right under the mouse, and starts dragging it
  function pickUp(spot, event) {
    let item = getItem(spot.itemId);
    let mouseX = (event.clientX - stage.left) / stage.scale;
    let mouseY = (event.clientY - stage.top) / stage.scale;
    // keep the same spot under the mouse, but at full size
    let grabX = (mouseX - spot.x) / spot.scale;
    let grabY = (mouseY - spot.y) / spot.scale;

    let newPiece = {
      id: makeId(),
      itemId: item.id,
      x: mouseX - grabX,
      y: mouseY - grabY,
      scale: 1,
      z: nextZ(pieces),
      parent: null,
    };
    setPieces([...pieces, newPiece]);
    setScattered(scattered.filter((other) => other.itemId != spot.itemId));
    startDrag(newPiece.id, event, true);
  }

  /* ---------- Keyboard ---------- */

  useEffect(() => {
    function onKey(event) {
      let ctrlZ = (event.metaKey || event.ctrlKey) && event.key == "z";
      if (ctrlZ) {
        event.preventDefault();
        undo();
      } else if (event.key == "Escape") {
        setView("room");
        setErasing(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ---------- What to show ---------- */

  let empty = pieces.length == 0;
  let category = categories.find((c) => c.id == section);

  let className = "dollhouse";
  if (erasing) {
    className = className + " erasing";
  }
  if (draggingId != null) {
    className = className + " is-dragging";
  }

  return (
    <div className={className} onPointerDown={pressRoom} onWheel={scrollRoom}>
      {/* The room */}
      <Stage stage={stage} className="room">
        {piecesInOrder(pieces).map((piece, i) => (
          <Piece
            key={piece.id}
            piece={piece}
            pieces={pieces}
            layer={i + 1}
            draggingId={draggingId}
          />
        ))}
      </Stage>

      {/* The sticky note when the room is empty */}
      {view == "room" && empty && <StickyNote onClick={toggleMenu} />}

      {/* The cart menu and the scatter screen open on top of the room.
          While you drag something out, they fade so you can see the room */}
      {view != "room" && (
        <div
          className={draggingId != null ? "overlay hidden" : "overlay"}
          onPointerDown={(event) => {
            event.stopPropagation();
            // clicking the empty background closes it
            if (event.target == event.currentTarget) {
              setView("room");
            }
          }}
        >
          <Stage stage={stage} className="overlay-stage">
            {view == "menu" && <CartMenu onPick={openSection} />}
            {view == "scatter" && category && (
              <ScatterView
                key={scatterRound}
                label={category.label}
                scattered={scattered}
                onPickUp={pickUp}
              />
            )}
          </Stage>
        </div>
      )}

      {/* The buttons in the corners. The cart hides while its menu is open */}
      {view != "menu" && (
        <ImageButton
          className={empty ? "cart-button wiggle" : "cart-button"}
          image="cart.png"
          label="Open the cart"
          onClick={toggleMenu}
        />
      )}
      {view == "room" && !empty && (
        <ImageButton
          className={erasing ? "erase-button on" : "erase-button"}
          image="erase.png"
          label="Erase"
          onClick={() => setErasing(!erasing)}
        />
      )}
      {view == "room" && (!empty || history.length > 0) && (
        <ImageButton
          className="undo-button"
          image="ctrl+z.png"
          label="Undo"
          onClick={undo}
          disabled={history.length == 0}
        />
      )}
    </div>
  );
}

/*
The 1440 x 900 canvas, scaled to fit the window.
The room, the cart menu and the scatter screen each sit on one,
so they all line up.
*/
function Stage({ stage, className, children }) {
  return (
    <div
      className={"stage " + className}
      style={{
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        left: stage.left,
        top: stage.top,
        transform: `scale(${stage.scale})`,
      }}
    >
      {children}
    </div>
  );
}

// One of my hand-drawn buttons from the buttons folder
function ImageButton({ className, image, label, onClick, disabled }) {
  return (
    <button
      className={"corner-button " + className}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <img
        src={assetUrl("dollhouseAssets/buttons/" + image)}
        alt=""
        draggable={false}
      />
    </button>
  );
}

// The instructions note on the empty page. Clicking it opens the cart too
function StickyNote({ onClick }) {
  return (
    <button className="sticky-note" onClick={onClick}>
      <img
        src={assetUrl("dollhouseAssets/buttons/home-instructions.png")}
        alt="drag and drop items from the cart to start playing with my dollhouse"
        draggable={false}
      />
    </button>
  );
}
