import { assetUrl } from "../utils/items.js";
import "../styles/buttons.css";

// The hand-drawn buttons pinned to the corners of the page.
export function CartButton({ onClick, isInviting }) {
  return (
    <button
      className={`corner-button cart-button ${isInviting ? "is-inviting" : ""}`}
      onClick={onClick}
      aria-label="Open the cart"
    >
      <img src={assetUrl("dollhouseAssets/buttons/cart.png")} alt="" draggable={false} />
    </button>
  );
}

export function EraseButton({ isActive, onClick }) {
  return (
    <button
      className={`corner-button erase-button ${isActive ? "is-active" : ""}`}
      onClick={onClick}
      aria-pressed={isActive}
      aria-label="Erase mode"
      title="Click to erase things (or drag something here)"
      data-erase-target
    >
      <img src={assetUrl("dollhouseAssets/buttons/erase.png")} alt="" draggable={false} />
    </button>
  );
}

export function UndoButton({ onClick, disabled }) {
  return (
    <button
      className="corner-button undo-button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Undo"
      title="Undo (Ctrl/Cmd + Z)"
    >
      <img src={assetUrl("dollhouseAssets/buttons/ctrl+z.png")} alt="" draggable={false} />
    </button>
  );
}

export function HomeNote({ onClick }) {
  return (
    <button className="home-note" onClick={onClick} aria-label="Open the cart to start">
      <img src={assetUrl("dollhouseAssets/buttons/home-instructions.png")} alt="drag and drop items from the cart to start playing with my dollhouse" draggable={false} />
    </button>
  );
}
